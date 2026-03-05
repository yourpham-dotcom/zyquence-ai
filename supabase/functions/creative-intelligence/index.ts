import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, title, description, idea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userMessage = "";

    if (action === "analyze") {
      systemPrompt = `You are an AI idea analyst. Analyze the given idea and return a JSON object with these exact fields:
- idea_score (0-100): overall viability
- market_potential (0-100): market opportunity
- execution_complexity (0-100): how complex to execute
- risk_level (0-100): risk assessment
- trend_alignment (0-100): alignment with current trends
- summary (string): 2-3 sentence evaluation
- strengths (array of 3 strings): key strengths
- weaknesses (array of 3 strings): key weaknesses
- recommendations (array of 3 strings): actionable recommendations

Return ONLY valid JSON, no markdown, no code blocks.`;
      userMessage = `Title: ${title}\nDescription: ${description}`;
    } else if (action === "strategy") {
      systemPrompt = `You are an AI strategy generator. Convert the given idea into a structured strategy. Return a JSON object with:
- overview (string): 2-3 sentence strategy overview
- steps (array of objects with: phase, title, duration, description)
- team_size (string): recommended team size
- timeline (string): total timeline
- budget (string): estimated budget range
- risks (array of 3 strings): key risks
- success_metrics (array of 3 strings): how to measure success

Return ONLY valid JSON, no markdown, no code blocks.`;
      userMessage = `Title: ${idea?.title || title}\nDescription: ${idea?.description || description}\nIdea Score: ${idea?.idea_score || 'N/A'}`;
    } else if (action === "insights") {
      systemPrompt = `You are an AI insights generator for a creative intelligence platform. Based on the user's ideas, generate actionable insights. Return a JSON object with:
- insights (array of objects with: title, description, type (one of: Bottleneck, Trend, Optimization, Prediction, Strategy, Suggestion), priority (high/medium/low))
- opportunities (array of objects with: title, confidence (0-100), impact (High/Medium/Low), action, category (Market Trend/Social Trend/Business/Emerging))

Return ONLY valid JSON, no markdown, no code blocks.`;
      userMessage = idea ? `Ideas context: ${JSON.stringify(idea)}` : "Generate general creative intelligence insights for a startup founder.";
    }

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
          { role: "user", content: userMessage },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    
    // Clean markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("creative-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
