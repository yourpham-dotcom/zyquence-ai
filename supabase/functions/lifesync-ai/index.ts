import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, eventId, participants, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const participantContext = (participants || [])
      .map((p: any) => `- ${p.display_name} (user_id: ${p.user_id}, status: ${p.status})`)
      .join("\n");

    const systemPrompt = `You are LifeSync AI, analyzing group chat messages for attendance changes in a collaborative event. Current participants:\n${participantContext || "None yet."}\n\nDetect attendance status changes from the message. Look for phrases like "I can't make it", "count me in", "bringing a friend", "[name] isn't coming", etc. Only call the tool if you detect a clear attendance change. Do not use markdown.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "update_attendance",
          description: "Update attendance status for one or more participants based on chat message",
          parameters: {
            type: "object",
            properties: {
              updates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    user_id: { type: "string", description: "The user_id of the participant" },
                    display_name: { type: "string", description: "Name mentioned in message" },
                    new_status: { type: "string", enum: ["attending", "maybe", "cancelled", "pending"] },
                    reason: { type: "string" },
                  },
                  required: ["new_status"],
                },
              },
            },
            required: ["updates"],
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
          { role: "user", content: message },
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ detected: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ detected: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const toolCalls = aiData.choices?.[0]?.message?.tool_calls || [];
    const changes: any[] = [];

    for (const tc of toolCalls) {
      if (tc.function.name === "update_attendance") {
        const args = JSON.parse(tc.function.arguments);
        for (const upd of (args.updates || [])) {
          if (upd.user_id) {
            await sb.from("lifesync_participants")
              .update({ status: upd.new_status, updated_at: new Date().toISOString() })
              .eq("event_id", eventId)
              .eq("user_id", upd.user_id);
            changes.push({ user_id: upd.user_id, status: upd.new_status, reason: upd.reason });
          }
        }
      }
    }

    return new Response(JSON.stringify({ detected: changes.length > 0, changes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lifesync-ai error:", e);
    return new Response(JSON.stringify({ detected: false, error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
