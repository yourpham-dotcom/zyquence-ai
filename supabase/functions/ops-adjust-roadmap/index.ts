import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { adjustment, tasks, milestones, projectGoal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert project manager and timeline optimizer.

The user will provide their current project tasks, milestones, and an adjustment request (e.g. "Marketing is delayed by 3 days").

Analyze the impact and return an updated schedule that:
1. Applies the requested change
2. Shifts dependent tasks accordingly
3. Keeps logical sequencing
4. Flags any milestones at risk

Return valid JSON with this structure:
{
  "adjustedTasks": [
    {
      "id": "task-id",
      "title": "task title",
      "new_deadline": "YYYY-MM-DD",
      "reason": "brief reason for change"
    }
  ],
  "adjustedMilestones": [
    {
      "id": "milestone-id",
      "title": "milestone title",
      "new_target_date": "YYYY-MM-DD",
      "at_risk": true/false
    }
  ],
  "summary": "Brief summary of changes made",
  "warnings": ["any warnings about timeline impact"]
}

ONLY return valid JSON, no markdown or extra text.`;

    const userPrompt = `Project Goal: ${projectGoal}

Current Tasks:
${JSON.stringify(tasks, null, 2)}

Current Milestones:
${JSON.stringify(milestones, null, 2)}

Adjustment Request: ${adjustment}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch {
      parsed = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ops-adjust-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
