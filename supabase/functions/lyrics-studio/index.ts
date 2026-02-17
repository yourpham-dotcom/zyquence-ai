import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, lyrics, topic, artistInspiration, genre, mood, songStructure, humanizationStrength, slangLevel, emotionLevel, energyLevel, creativityLevel, action } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "humanize") {
      systemPrompt = `You are an expert songwriting assistant specializing in making lyrics sound natural, human, and emotionally authentic. You are inspired by melodic emotional rap and R&B styles.

Rules:
- Preserve the original meaning of the lyrics
- Remove robotic or overly formal phrasing
- Improve rhythm, flow, and rhyme quality
- Add conversational tone and natural imperfections
- Use contractions and natural speech patterns
- Increase emotional realism
- Avoid overly perfect grammar where it sounds unnatural
- Make lyrics sound like they were written by a real artist
- Never claim to mimic or replicate an exact artist
- Match the requested style inspiration without copying
- Do NOT use any markdown formatting symbols like asterisks, hashes, or bullet points
- Return clean plain text with line breaks only
- Humanization strength: ${humanizationStrength || "medium"} (light = subtle tweaks, medium = noticeable rewrites, heavy = significant transformation)
- Slang level: ${slangLevel || "moderate"} (clean = formal, moderate = conversational, street = heavy slang)
- Emotion level: ${emotionLevel || "balanced"} (chill = understated, balanced = natural emotion, deep = intense feeling)`;

      if (action === "emotional") {
        userPrompt = `Take these lyrics and make them significantly more emotional and heartfelt. Deepen the feeling while keeping the flow:\n\n${lyrics}`;
      } else if (action === "catchy") {
        userPrompt = `Take these lyrics and make them catchier with better hooks, more memorable phrases, and improved rhythm:\n\n${lyrics}`;
      } else {
        userPrompt = `Humanize and improve these lyrics${artistInspiration ? ` with a style inspired by ${artistInspiration}'s melodic approach` : ""}. Genre: ${genre || "rap"}. Mood: ${mood || "confident"}.\n\n${lyrics}`;
      }
    } else if (mode === "generate") {
      systemPrompt = `You are an expert songwriter who creates original, performance-ready lyrics. You write with vivid imagery, natural rhyme patterns, and authentic personality.

Rules:
- Follow the user's topic, mood, and genre direction
- Create natural rhyme patterns that flow musically
- Maintain musical rhythm suitable for performance
- Use vivid imagery and metaphors
- Add personality and authenticity
- Make lyrics performance-ready
- Avoid generic AI phrases
- Keep lines concise and rhythmic
- Do NOT use any markdown formatting symbols like asterisks, hashes, or bullet points
- Return clean plain text with line breaks
- Label sections naturally (Verse 1, Hook, etc.) without markdown
- Energy level: ${energyLevel || "mid"} (calm = mellow vibe, mid = balanced energy, high = intense/hype)
- Creativity level: ${creativityLevel || "balanced"} (safe = conventional, balanced = fresh but accessible, experimental = unique/abstract)`;

      userPrompt = `Write ${songStructure || "a full song"} about: ${topic || "life and ambition"}.${artistInspiration ? ` Style inspired by ${artistInspiration}'s approach.` : ""} Genre: ${genre || "rap"}. Mood: ${mood || "confident"}.`;
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
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("lyrics-studio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
