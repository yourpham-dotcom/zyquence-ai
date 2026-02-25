import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Analyze this image. It may be a screenshot of a group chat, a guest list, invitations, notes, or any content related to social plans and events.

Extract ALL people/attendees mentioned and any event details you can detect.

Return ONLY valid JSON (no markdown):
{
  "guests": [
    {
      "name": "Person Name",
      "status": "attending" | "maybe" | "cancelled" | "unknown",
      "confidence": 0.0-1.0
    }
  ],
  "event_context": {
    "name": "Event name if detected or null",
    "date": "Date if detected (YYYY-MM-DD) or null",
    "time": "Time if detected (HH:MM) or null",
    "location": "Location if detected or null"
  }
}

Rules:
- Extract ALL names mentioned as attendees/participants
- Infer status from context: "coming" = attending, "can't make it" = cancelled, "+1" = attending, "maybe" = maybe
- If someone mentions bringing someone else (e.g., "Sarah +1" or "bringing Mike"), add both
- Look for time, date, location, and event name clues
- Set lower confidence for names you're less sure about
- If no event context is found, return nulls for those fields`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      return new Response(JSON.stringify({ guests: [], event_context: null, error: "Could not parse scan results" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lifeos-scan error:", e);
    return new Response(JSON.stringify({ error: e.message || "Scan failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
