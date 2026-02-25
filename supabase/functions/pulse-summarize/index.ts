import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = type === "detect_tasks"
      ? `You are an AI that analyzes voice conversation transcripts to detect tasks, assignments, deadlines, and decisions. 
         Analyze the transcript and extract any actionable items.
         Use the extract_tasks tool to return structured data.`
      : `You are an AI that summarizes voice meetings/calls. 
         Analyze the transcript and produce a comprehensive summary.
         Use the meeting_summary tool to return structured data.`;

    const tools = type === "detect_tasks"
      ? [{
          type: "function",
          function: {
            name: "extract_tasks",
            description: "Extract detected tasks from transcript",
            parameters: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      assigned_to: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                      deadline_hint: { type: "string" },
                    },
                    required: ["title", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["tasks"],
              additionalProperties: false,
            },
          },
        }]
      : [{
          type: "function",
          function: {
            name: "meeting_summary",
            description: "Generate meeting summary from transcript",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                key_decisions: {
                  type: "array",
                  items: { type: "string" },
                },
                action_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      assigned_to: { type: "string" },
                      priority: { type: "string" },
                    },
                    required: ["title"],
                    additionalProperties: false,
                  },
                },
                topics_discussed: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["summary", "key_decisions", "action_items"],
              additionalProperties: false,
            },
          },
        }];

    const toolChoice = type === "detect_tasks"
      ? { type: "function", function: { name: "extract_tasks" } }
      : { type: "function", function: { name: "meeting_summary" } };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${res.status}`);
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
