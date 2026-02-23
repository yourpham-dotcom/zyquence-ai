import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, goal, deadline, teamMembers, notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert operations manager and project planner. Convert the user's business goal into a structured project plan.

Return a valid JSON object with this exact structure:
{
  "phases": [
    {
      "name": "Phase Name",
      "tasks": [
        {
          "title": "Task title",
          "description": "Brief description",
          "assigned_to": "Team member name or role",
          "priority": "high" | "medium" | "low",
          "estimated_days": number,
          "dependencies": ["other task title if any"]
        }
      ]
    }
  ],
  "milestones": [
    {
      "title": "Milestone title",
      "estimated_days_from_start": number
    }
  ],
  "summary": "Brief project summary"
}

Rules:
- Create 2-5 phases
- Each phase should have 2-6 tasks
- Assign tasks to team members provided, or suggest roles
- Set realistic priorities and timelines
- Include 2-4 milestones
- Keep descriptions concise and actionable
- ONLY return valid JSON, no markdown or extra text`;

    const userPrompt = `Project Title: ${title}
Goal: ${goal}
${deadline ? `Deadline: ${deadline}` : "No specific deadline"}
Team Members: ${teamMembers?.length ? teamMembers.join(", ") : "Not specified - suggest roles"}
${notes ? `Notes/Constraints: ${notes}` : ""}`;

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

    // Parse JSON from response (handle markdown code blocks)
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
    console.error("ops-generate-project error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
