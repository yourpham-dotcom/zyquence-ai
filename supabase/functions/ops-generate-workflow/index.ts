import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, notes, teamMembers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert systems and operations designer.

Convert the user's goal into a workflow map — a process flow diagram showing how work moves through phases, teams, or steps.

Generate:
- Process steps (nodes) with clear labels
- Connections between steps (edges) showing flow direction
- Logical sequence from start to finish
- Inputs and outputs where relevant
- Dependencies between steps

Return structured JSON with this exact format:
{
  "nodes": [
    {
      "id": "1",
      "label": "Step Name",
      "description": "What happens in this step",
      "owner": "Team member or role",
      "node_type": "start" | "step" | "decision" | "end",
      "status": "pending"
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "label": "optional edge label"
    }
  ],
  "summary": "Brief workflow description"
}

Rules:
- Always include a "start" node and an "end" node
- Create 5-12 process steps
- Include 1-2 decision nodes where branching occurs
- Assign owners from provided team members or suggest roles
- Keep labels concise (2-5 words)
- Keep descriptions under 20 words
- Edges should create a logical, connected flow
- ONLY return valid JSON, no markdown or extra text`;

    const userPrompt = `Goal: ${goal}
${notes ? `Notes/Constraints: ${notes}` : ""}
Team Members: ${teamMembers?.length ? teamMembers.join(", ") : "Not specified - suggest roles"}`;

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
    console.error("ops-generate-workflow error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
