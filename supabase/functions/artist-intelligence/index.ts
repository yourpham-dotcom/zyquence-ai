import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, string> = {
  identity: `You are an AI Artist Identity Analyzer for a music creative intelligence platform.
Analyze the creator profile and generate a comprehensive identity analysis. Return ONLY valid JSON with NO markdown formatting, no asterisks, no bold text.
Return JSON with these exact keys:
{
  "archetype": "A 2-3 word artist archetype",
  "brand_personality": "3-4 sentence brand personality description",
  "audience_profile": "3-4 sentence target audience description",
  "stage_name_suggestions": ["name1", "name2", "name3", "name4", "name5"],
  "visual_aesthetic": "3-4 sentence visual direction description",
  "messaging_tone": "2-3 sentence messaging tone description"
}
Do not use any markdown. Plain text only in all values.`,

  sound: `You are an AI Sound Direction Advisor for a music creative intelligence platform.
Analyze the creator profile and generate sound recommendations. Return ONLY valid JSON with NO markdown formatting.
Return JSON with these exact keys:
{
  "genre_scores": {"Hip-Hop": 85, "R&B": 70, "Pop": 55, "Electronic": 40, "Rock": 30, "Jazz": 25},
  "bpm_range": {"min": 80, "max": 140, "sweet_spot": 110},
  "beat_styles": ["style1", "style2", "style3", "style4"],
  "vocal_guidance": "3-4 sentence vocal delivery guidance",
  "flow_ideas": ["idea1", "idea2", "idea3", "idea4"],
  "comparable_artists": ["artist1", "artist2", "artist3"],
  "music_lane_summary": "3-4 sentence summary of their ideal music lane"
}
All genre scores should be 0-100 integers. Plain text only.`,

  translator: `You are an AI Experience-to-Music Translator for a creative intelligence platform.
Convert the user's personal experiences into music themes and concepts. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "song_topics": [{"title": "topic", "description": "2 sentences"}],
  "hook_concepts": [{"hook": "hook line", "context": "1 sentence"}],
  "emotional_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "storytelling_angles": [{"angle": "angle name", "description": "2 sentences"}]
}
Generate at least 4 items per array. Plain text only.`,

  readiness: `You are an AI Artist Readiness Scorer for a music creative intelligence platform.
Evaluate the creator's readiness across categories. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "overall_score": 72,
  "brand_clarity": 68,
  "voice_potential": 80,
  "consistency": 55,
  "market_positioning": 70,
  "story_authenticity": 85,
  "explanation": "3-4 sentence overall assessment",
  "recommendations": [{"category": "category", "suggestion": "2-3 sentence suggestion"}]
}
All scores 0-100 integers. Generate 4-5 recommendations. Plain text only.`,

  strategy: `You are an AI Strategy Advisor for a music creative intelligence platform.
Create an actionable career strategy. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "content_strategy": [{"action": "action", "details": "2 sentences", "timeline": "timeframe"}],
  "release_roadmap": [{"milestone": "milestone", "description": "1-2 sentences", "timeline": "timeframe"}],
  "brand_positioning": "3-4 sentence brand positioning advice",
  "growth_recommendations": [{"area": "area", "suggestion": "2 sentences"}],
  "next_steps": [{"step": "step", "priority": "high/medium/low"}],
  "priority_actions": [{"action": "action", "impact": "1 sentence"}],
  "long_term_strategy": "3-4 sentence long term vision"
}
Generate 3-5 items per array. Plain text only.`,

  feedback: `You are an AI Music Feedback Coach for a creative intelligence platform.
Analyze the submitted lyrics and provide detailed feedback. Return ONLY valid JSON with NO markdown.
Return JSON with these exact keys:
{
  "flow_score": 75,
  "authenticity_score": 80,
  "energy_score": 70,
  "commercial_appeal_score": 65,
  "improvement_suggestions": [{"area": "area", "suggestion": "2-3 sentences"}],
  "strengths": ["strength1", "strength2"],
  "overall_feedback": "3-4 sentence overall assessment"
}
All scores 0-100. Generate 3-5 suggestions. Plain text only.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { module, profile, input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = PROMPTS[module];
    if (!systemPrompt) throw new Error(`Unknown module: ${module}`);

    const userContent = module === "feedback"
      ? `Lyrics to analyze:\n${input}`
      : module === "translator"
      ? `Personal experiences to translate:\n${JSON.stringify(input)}`
      : `Creator Profile:\n${JSON.stringify(profile)}`;

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
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response, handling potential markdown wrapping
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("artist-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
