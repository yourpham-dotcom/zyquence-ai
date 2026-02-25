import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;

    const { message, workLogs } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a work log / payroll assistant. You help users manage employee work logs by interpreting natural language commands.

Given the user's current work logs (JSON array below), interpret their message and return a JSON response with the action to take.

Current work logs:
${JSON.stringify(workLogs || [], null, 2)}

You MUST respond with valid JSON in this exact format:
{
  "action": "add" | "update" | "delete" | "info",
  "entries": [
    {
      "id": "uuid or null for new entries",
      "employee_name": "employee name",
      "work_date": "YYYY-MM-DD",
      "start_time": "HH:MM (24h)",
      "end_time": "HH:MM (24h)",
      "hours": number,
      "hourly_rate": number,
      "total_pay": number,
      "notes": "optional notes"
    }
  ],
  "message": "A friendly confirmation message describing what you did"
}

Rules:
- For "add": create new entries. Set id to null. Calculate hours from start_time and end_time if not provided. Calculate total_pay = hours × hourly_rate.
- For "update": modify existing entries. Include the id from the current work logs. Only include fields that changed plus the id. Recalculate total_pay if hours or hourly_rate changed.
- For "delete": remove entries. Include just the id and employee_name.
- For "info": no changes, just answer the question in "message".
- If user says "add John 9am-5pm at $20/hr", parse that as employee_name: "John", start_time: "09:00", end_time: "17:00", hours: 8, hourly_rate: 20, total_pay: 160.
- If user doesn't specify a date, use today: ${new Date().toISOString().split("T")[0]}.
- Be smart about matching employee names (fuzzy match).
- Always respond with valid JSON only, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ action: "info", entries: [], message: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    if (parsed.action === "add" && parsed.entries?.length) {
      for (const entry of parsed.entries) {
        const hours = entry.hours || 8;
        const rate = entry.hourly_rate || 0;
        const totalPay = entry.total_pay || Math.round(hours * rate * 100) / 100;
        const { data, error } = await supabase.from("work_logs").insert({
          user_id: userId,
          employee_name: entry.employee_name || "Unknown",
          work_date: entry.work_date || new Date().toISOString().split("T")[0],
          start_time: entry.start_time || "09:00",
          end_time: entry.end_time || "17:00",
          hours,
          hourly_rate: rate,
          total_pay: totalPay,
          notes: entry.notes || null,
        }).select().single();
        if (error) results.push({ error: error.message, entry: entry.employee_name });
        else results.push(data);
      }
    } else if (parsed.action === "update" && parsed.entries?.length) {
      for (const entry of parsed.entries) {
        if (!entry.id) continue;
        const updates: any = {};
        if (entry.employee_name !== undefined) updates.employee_name = entry.employee_name;
        if (entry.work_date !== undefined) updates.work_date = entry.work_date;
        if (entry.start_time !== undefined) updates.start_time = entry.start_time;
        if (entry.end_time !== undefined) updates.end_time = entry.end_time;
        if (entry.hours !== undefined) updates.hours = entry.hours;
        if (entry.hourly_rate !== undefined) updates.hourly_rate = entry.hourly_rate;
        if (entry.total_pay !== undefined) updates.total_pay = entry.total_pay;
        if (entry.notes !== undefined) updates.notes = entry.notes;

        const { data, error } = await supabase.from("work_logs").update(updates).eq("id", entry.id).select().single();
        if (error) results.push({ error: error.message, entry: entry.employee_name });
        else results.push(data);
      }
    } else if (parsed.action === "delete" && parsed.entries?.length) {
      for (const entry of parsed.entries) {
        if (!entry.id) continue;
        const { error } = await supabase.from("work_logs").delete().eq("id", entry.id);
        if (error) results.push({ error: error.message, entry: entry.employee_name });
        else results.push({ deleted: true, id: entry.id, employee_name: entry.employee_name });
      }
    }

    return new Response(JSON.stringify({
      action: parsed.action,
      message: parsed.message,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("worklog-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
