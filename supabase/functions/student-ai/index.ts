import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, string> = {
  summary: "You are a study assistant. Summarize the following notes into clear, concise key points with bullet points. Focus on the most important concepts.",
  flashcards: "You are a study assistant. Generate 10 flashcards from the following content. Format each as:\nQ: [question]\nA: [answer]\n\nMake questions test understanding, not just memorization.",
  quiz: "You are a study assistant. Generate a 10-question practice quiz from the following content. Include multiple choice (4 options) and short answer questions. Provide the answer key at the end.",
  study_guide: "You are a study assistant. Create a structured study guide from the following content. Include: Overview, Key Concepts, Important Terms, Study Tips, and Practice Questions.",
  career: `You are a career counselor AI. Based on the user's interests, skills, and education, suggest 3-5 career paths. Return a JSON array where each object has: career (string), description (string), education (string array of steps), skills (string array), salary_range (string like "$50k-$80k"), match_reason (string). Return ONLY valid JSON array, no other text.`,
  resume: "You are a professional resume writer. Generate a clean, well-structured resume based on the provided information. Use professional language, action verbs, and quantified achievements where possible. Format it clearly with sections.",
  cover_letter: "You are a professional resume writer. Generate a compelling cover letter based on the provided information. Make it personalized, professional, and highlight relevant skills and experiences. Keep it to one page length.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, text } = await req.json();
    const systemPrompt = PROMPTS[mode];
    if (!systemPrompt) throw new Error("Invalid mode");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
          { role: "user", content: text },
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
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("student-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
