import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, projectTitle, projectGoal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a task detection assistant for a team collaboration tool. Analyze the message and determine if it contains an actionable task.

Look for patterns like:
- Assignments: "John can you handle...", "Take care of..."
- Deadlines: "by Friday", "this week", "before March"
- Action items: "We need to...", "Let's finish...", "Make sure to..."
- Requests: "Can someone...", "Please update..."

If a task is detected, return JSON:
{
  "detected": true,
  "task": {
    "title": "Short task title",
    "description": "Brief description from context",
    "assigned_to": "Person name if mentioned, or null",
    "priority": "high" | "medium" | "low",
    "deadline_hint": "Extracted deadline text or null"
  }
}

If no task is detected, return:
{ "detected": false }

ONLY return valid JSON, no markdown or extra text.`;

    const userPrompt = `Message: "${message}"
${projectTitle ? `Project: ${projectTitle}` : ""}
${projectGoal ? `Project Goal: ${projectGoal}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ detected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ detected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch {
      parsed = { detected: false };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-detect-task error:", e);
    return new Response(JSON.stringify({ detected: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
