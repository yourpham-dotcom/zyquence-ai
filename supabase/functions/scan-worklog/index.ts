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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            role: "system",
            content: `You are a work log / timesheet detection AI. Analyze images of timesheets, schedules, punch cards, or handwritten work logs and extract employee hour details. You MUST call the extract_work_logs function. If you cannot detect details confidently, still return what you can with reasonable defaults.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this work log / timesheet image. Extract employee names, dates, start times, end times, hours worked, hourly rates if visible, and any notes. If there are multiple employees, extract each one separately." },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_work_logs",
              description: "Extract work log entries from the image",
              parameters: {
                type: "object",
                properties: {
                  entries: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        employee_name: { type: "string", description: "Employee name" },
                        date: { type: "string", description: "Work date in YYYY-MM-DD format" },
                        start_time: { type: "string", description: "Start time in HH:MM 24h format" },
                        end_time: { type: "string", description: "End time in HH:MM 24h format" },
                        hours: { type: "number", description: "Hours worked" },
                        hourly_rate: { type: "number", description: "Hourly rate if visible, else 0" },
                        notes: { type: "string", description: "Any notes or comments" },
                        confidence: { type: "number", description: "0-1 confidence score" }
                      },
                      required: ["employee_name", "confidence"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["entries"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_work_logs" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ entries: parsed.entries }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ entries: [], lowConfidence: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-worklog error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
