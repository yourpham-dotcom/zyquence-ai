import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, mode, planId, adjustment, existingPlan } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "adjust" && existingPlan) {
      systemPrompt = `You are Life Planner AI, an intelligent lifestyle planning assistant. The user has an existing plan and wants to adjust it. Provide updated plan based on their request. Be encouraging, practical, and non-judgmental. Do not use markdown formatting symbols like asterisks or hashes. Use plain text only.`;
      userPrompt = `Current plan:\n${JSON.stringify(existingPlan, null, 2)}\n\nAdjustment request: ${adjustment}`;
    } else {
      systemPrompt = `You are Life Planner AI, an intelligent lifestyle planning assistant. Analyze the user's goal considering workload intensity, time constraints, stress indicators, lifestyle factors, and feasibility. Provide supportive, encouraging, practical, non-judgmental feedback. Do not use markdown formatting symbols like asterisks or hashes. Use plain text only.`;
      userPrompt = `The user wants to achieve this: "${goal}"\n\nAnalyze their situation and create a structured life plan.`;
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_life_plan",
          description: "Generate a structured life plan with analysis, phases, and actionable tasks",
          parameters: {
            type: "object",
            properties: {
              analysis: {
                type: "object",
                properties: {
                  workload_assessment: { type: "string", description: "Assessment of current workload" },
                  stress_level: { type: "string", enum: ["low", "moderate", "high", "very_high"] },
                  feasibility: { type: "string", enum: ["highly_feasible", "feasible", "challenging", "needs_adjustment"] },
                  encouragement: { type: "string", description: "Supportive feedback message" },
                },
                required: ["workload_assessment", "stress_level", "feasibility", "encouragement"],
              },
              plan: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string", description: "Brief plan overview" },
                  timeline: { type: "string", description: "Overall timeline estimate" },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Phase name like Preparation, Execution, Recovery" },
                        description: { type: "string" },
                        tasks: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              suggested_time: { type: "string", description: "When to do this" },
                              priority: { type: "string", enum: ["low", "medium", "high"] },
                              notes: { type: "string" },
                              estimated_minutes: { type: "number" },
                            },
                            required: ["title", "priority"],
                          },
                        },
                      },
                      required: ["name", "tasks"],
                    },
                  },
                  risk_considerations: {
                    type: "array",
                    items: { type: "string" },
                  },
                  recovery_suggestions: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["title", "summary", "phases"],
              },
            },
            required: ["analysis", "plan"],
          },
        },
      },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_life_plan" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 });
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      const content = aiData.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ error: "Could not generate plan", fallback: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("life-planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
