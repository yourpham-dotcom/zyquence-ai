import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goalDescription, targetAmount, deadline, currentIncome, notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial planning assistant helping users create a structured financial execution roadmap. Provide practical steps, phases, and milestones for achieving the user's financial goal.

Return a valid JSON object with this exact structure:
{
  "phases": [
    {
      "name": "Phase Name",
      "tasks": [
        {
          "title": "Task title",
          "description": "Brief description",
          "priority": "high" | "medium" | "low",
          "estimated_days": number
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
  "recommendations": [
    "Actionable recommendation string"
  ],
  "summary": "Brief financial plan summary",
  "estimated_monthly_savings": number,
  "risk_level": "low" | "medium" | "high"
}

Rules:
- Create 2-5 phases
- Each phase should have 2-5 tasks
- Set realistic priorities and timelines
- Include 2-4 milestones
- Include 3-6 actionable recommendations
- Keep descriptions concise and actionable
- Consider the user's income and constraints
- ONLY return valid JSON, no markdown or extra text`;

    const userPrompt = `Financial Goal: ${goalDescription}
${targetAmount ? `Target Amount: $${targetAmount}` : "No specific target amount"}
${deadline ? `Deadline: ${deadline}` : "No specific deadline"}
${currentIncome ? `Current Monthly Income: $${currentIncome}` : "Income not specified"}
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
    console.error("vault-generate-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
