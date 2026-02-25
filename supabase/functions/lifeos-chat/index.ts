import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, userId, eventId, events, guests, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const eventsContext = (events || []).map((e: any) => `- "${e.name}" (id: ${e.id}, date: ${e.event_date}, time: ${e.event_time || "TBD"}, location: ${e.location || "TBD"})`).join("\n");
    const guestsContext = (guests || []).map((g: any) => `- ${g.guest_name} (status: ${g.status}, id: ${g.id})`).join("\n");

    const systemPrompt = mode === "scan"
      ? `You are LifeOS Scanner. Extract guest names from user input. Return a JSON tool call with extracted names. If event context is detected, note it. Current events:\n${eventsContext}`
      : `You are LifeOS, a personal life planning assistant. Help users manage events and guest lists using natural language.

Current events:\n${eventsContext || "No events yet."}
${eventId ? `\nCurrently viewing event ID: ${eventId}\nGuests:\n${guestsContext || "No guests yet."}` : ""}

You can perform these actions via tool calls:
- add_guests: Add guests to an event
- update_guest_status: Update a guest's attendance status
- remove_guest: Remove a guest
- update_event: Update event details (time, location, name, notes, status)
- log_update: Log a change description

Always be helpful and confirm what you did.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "add_guests",
          description: "Add one or more guests to an event",
          parameters: {
            type: "object",
            properties: {
              event_id: { type: "string" },
              guests: { type: "array", items: { type: "object", properties: { name: { type: "string" }, status: { type: "string", enum: ["attending", "maybe", "cancelled", "unknown"] } }, required: ["name"] } }
            },
            required: ["event_id", "guests"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_guest_status",
          description: "Update a guest's attendance status",
          parameters: {
            type: "object",
            properties: {
              guest_id: { type: "string" },
              status: { type: "string", enum: ["attending", "maybe", "cancelled", "unknown"] }
            },
            required: ["guest_id", "status"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "remove_guest",
          description: "Remove a guest from an event",
          parameters: {
            type: "object",
            properties: { guest_id: { type: "string" } },
            required: ["guest_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_event",
          description: "Update event details",
          parameters: {
            type: "object",
            properties: {
              event_id: { type: "string" },
              name: { type: "string" },
              event_time: { type: "string" },
              location: { type: "string" },
              notes: { type: "string" },
              status: { type: "string", enum: ["upcoming", "cancelled", "completed"] }
            },
            required: ["event_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "log_update",
          description: "Log an update/change description for an event",
          parameters: {
            type: "object",
            properties: {
              event_id: { type: "string" },
              description: { type: "string" }
            },
            required: ["event_id", "description"]
          }
        }
      }
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ reply: "Rate limited. Please try again in a moment." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ reply: "AI credits exhausted. Please add credits." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await aiRes.json();
    const choice = aiData.choices?.[0];
    let reply = choice?.message?.content || "";
    const toolCalls = choice?.message?.tool_calls || [];

    const actions: string[] = [];

    for (const tc of toolCalls) {
      const fn = tc.function.name;
      const args = JSON.parse(tc.function.arguments);

      if (fn === "add_guests") {
        for (const g of args.guests) {
          await sb.from("event_guests").insert({
            event_id: args.event_id,
            user_id: userId,
            guest_name: g.name,
            status: g.status || "unknown",
            added_by: mode === "scan" ? "scanner" : "chat",
          });
          actions.push(`Added ${g.name}`);
        }
        await sb.from("event_updates").insert({
          event_id: args.event_id,
          user_id: userId,
          change_description: `Added guests: ${args.guests.map((g: any) => g.name).join(", ")}`,
        });
      }

      if (fn === "update_guest_status") {
        await sb.from("event_guests").update({ status: args.status, updated_at: new Date().toISOString() }).eq("id", args.guest_id);
        actions.push(`Updated guest status to ${args.status}`);
        if (eventId) {
          await sb.from("event_updates").insert({
            event_id: eventId,
            user_id: userId,
            change_description: `Guest status changed to ${args.status}`,
          });
        }
      }

      if (fn === "remove_guest") {
        await sb.from("event_guests").delete().eq("id", args.guest_id);
        actions.push("Removed guest");
      }

      if (fn === "update_event") {
        const updates: any = {};
        if (args.name) updates.name = args.name;
        if (args.event_time) updates.event_time = args.event_time;
        if (args.location) updates.location = args.location;
        if (args.notes) updates.notes = args.notes;
        if (args.status) updates.status = args.status;
        updates.updated_at = new Date().toISOString();
        await sb.from("life_events").update(updates).eq("id", args.event_id);
        actions.push(`Updated event`);
        await sb.from("event_updates").insert({
          event_id: args.event_id,
          user_id: userId,
          change_description: `Event updated: ${Object.keys(updates).filter(k => k !== "updated_at").join(", ")}`,
        });
      }

      if (fn === "log_update" && args.event_id) {
        await sb.from("event_updates").insert({
          event_id: args.event_id,
          user_id: userId,
          change_description: args.description,
        });
      }
    }

    if (!reply && actions.length > 0) {
      reply = actions.join(". ") + ".";
    }
    if (!reply) reply = "I understood your message but couldn't determine what action to take. Try being more specific about which event and what change you'd like.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lifeos-chat error:", e);
    return new Response(JSON.stringify({ reply: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
