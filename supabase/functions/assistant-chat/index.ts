import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Zyquence AI — a smart, proactive assistant built into the Zyquence platform. You help users get the most out of their dashboard, build workflows, plan goals, and navigate to the right tools.

## ZYQUENCE PLATFORM — FULL FEATURE MAP

CORE DASHBOARD
- Home / Dashboard → /dashboard
- Calendar & Scheduling → /dashboard/calendar
- Finance & Budget Tracker → /dashboard/finance
- Goals & OKRs → /dashboard/goals
- AI Assistant (full page chat) → /dashboard/assistant
- Workspace & Notes → /dashboard/workspace
- Settings → /dashboard/settings
- Creator Productivity (AI coach) → /dashboard/creator-productivity
- Trading Journal → /dashboard/trading
- Workflow Engine / Ops → /dashboard/ops
- Atlas AI Map → /dashboard/atlas

PRO MODULES
- Data Intelligence (SQL lab, charts, datasets) → /data-intelligence
- Gaming Intelligence → /gaming-intelligence
- AI Builder (build custom AI tools) → /ai-builder
- Artist Intelligence (music identity, branding) → /artist-intelligence
- Creative Intelligence (AI content & strategy) → /creative-intelligence
- Music Intelligence → /music-intelligence
- Code Studio (AI-powered code editor) → /code-studio
- Studio (music, photo, video, creative tools) → /studio

SPECIFIC WORKFLOWS
- Project Manager → /gaming-intelligence/projects
- Mental Wellness → /gaming-intelligence/mental-wellness
- Code Practice → /gaming-intelligence/code-practice
- Artist Career Builder → /gaming-intelligence/artist-career
- Concert Builder → /gaming-intelligence/concert-builder
- Sports Arena → /gaming-intelligence/sports-arena
- Real Estate → /gaming-intelligence/real-estate
- Journal → /gaming-intelligence/journal
- Community / Connect → /connect

## HOW TO INCLUDE NAVIGATION BUTTONS
Whenever you recommend a feature or tool, ALWAYS include a clickable link using this format:
[LINK:Button Label|/path]

Examples:
[LINK:Open Goals|/dashboard/goals]
[LINK:Go to Finance|/dashboard/finance]
[LINK:Launch AI Builder|/ai-builder]
[LINK:Open Trading Journal|/dashboard/trading]

You can include multiple links. ALWAYS add links when mentioning a feature.

## YOUR ROLE
- Recommend the right Zyquence tool based on what the user describes
- Navigate users to any part of the dashboard via links
- Help users plan goals, set up workflows, organize finances, manage projects
- If someone says "build me a [thing]", identify the best Zyquence tool for it and send them there
- If someone asks to adjust or change something, guide them to the right settings or feature
- Be specific — always name the exact feature and link to it
- Keep responses to 2-4 sentences unless detail is requested
- Be friendly, confident, and actionable`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, systemContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const fullSystem = systemContext
      ? `${SYSTEM_PROMPT}\n\n## USER CONTEXT\n${systemContext}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: fullSystem }, ...messages],
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
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
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
    console.error("assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
