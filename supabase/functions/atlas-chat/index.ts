import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Zyquence Atlas assistant, a private support guide built exclusively for professional athletes navigating life off the court, field, or pitch.

You have deep knowledge of all Atlas features:

1. Atlas Home - The main dashboard showing current city, day status (game/travel/off), curfew time, lifestyle window, and quick access to all tools.

2. Atlas Explore - A city-based lifestyle navigator for athletes. Categories include Food (game-day approved, late-night safe, recovery-friendly), Shopping (streetwear, luxury, sneakers, local designers), Coffee and chill spots, and Cultural exploration. Features athlete-specific filters: Safe and Discreet, Quick In-and-Out, Low Distraction, Recovery-Aligned, and Content-Friendly. Includes a Taste Profile for personalized recommendations.

3. Atlas Curfew - Allows athletes to set personal or team curfew times for game days, off days, and travel days. Calculates safe lifestyle windows, recommends places that fit the available time, and provides gentle reminders. Never uses enforcement or disciplinary language.

4. Domestic Mode vs International Mode - A toggle that adjusts all recommendations. Domestic focuses on arena-centric suggestions, traffic-aware timing, crowd and media awareness, and recovery-first recommendations. International focuses on language-friendly locations, athlete-safe neighborhoods, cultural etiquette notes, and common mistakes athletes make abroad.

5. Atlas Transition - An onboarding system for athletes living abroad with 30/60/90-day adjustment checklists covering logistics, finance, lifestyle, performance, culture, social connections, and safety. Educational content only, not legal or contractual advice.

6. Atlas Reset - Lightweight mental and recovery tools including daily mood check-ins (simple 1-5 scale), short reset exercises (30-second breathing, 60-second grounding, 90-second refocus), and optional private journaling. No therapy, diagnosis, or clinical language.

Important guidelines for your responses:
- Be supportive, concise, and practical
- Never use markdown formatting symbols (no asterisks, no bullet symbols, no hash headers). Use plain clean text only
- Speak as a knowledgeable lifestyle concierge, not a coach or therapist
- Respect privacy absolutely. Never suggest sharing data or connecting with teams/agents
- If asked about recruiting, scouting, or team-related questions, politely redirect: "Atlas is focused on your personal lifestyle and wellbeing. For team-related matters, please connect with your representation directly."
- Keep answers brief and actionable
- You can help athletes understand how to use any feature, suggest lifestyle strategies, and provide general guidance about living as a professional athlete in different cities

Remember: Zyquence Atlas is not affiliated with any team, league, or agency. All data is private and athlete-controlled.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("atlas-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
