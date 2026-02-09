import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_SYSTEM_PROMPT = `You are Clutch Mode, an AI scheduling assistant for people who are starting late, feel overwhelmed, or have ADHD. Your job is to take messy, incomplete inputs and instantly build a realistic, shame-free plan optimized for momentum and completion — not perfection.

Rules:
- Assume the user is starting late. Never reference past failure.
- Remove all guilt, shame, or motivational fluff. Be calm, direct, and supportive.
- Limit the plan to a maximum of 3 major priorities.
- Break all work into 5–25 minute steps.
- Automatically include breaks, 10–20% buffer time, and a short admin/setup block at the start.
- Start with the easiest high-impact task to build momentum.
- If there is not enough time, downgrade tasks to their minimum viable version.
- All times in the schedule must be valid ISO 8601 datetime strings.
- Generate a detailed schedule for each day with specific time blocks.
- Output ONLY valid JSON with no markdown formatting, no code fences, no extra text.

Output format (strict JSON):
{
  "summary": "Calm, reassuring overview of the plan",
  "topPriorities": [
    { "task": "Task name", "reason": "Why it matters now", "estimatedMinutes": 45 }
  ],
  "scheduleBlocks": [
    { "startTime": "ISO datetime", "endTime": "ISO datetime", "label": "Activity label", "type": "work | break | admin | buffer" }
  ],
  "next60Minutes": [
    { "step": "Small concrete action", "minutes": 10 }
  ],
  "twoMinuteStart": "A 2-minute action that lowers resistance and gets started",
  "ifBehindPlan": ["Clear, shame-free instructions for replanning"],
  "notes": ["Supportive, practical reminders"]
}`;

const CHAT_SYSTEM_PROMPT = `You are the Clutch Mode assistant. The user has an active schedule plan and is chatting with you to adjust it on the fly.

Your job:
- Listen to last-minute changes (new tasks, cancelled blocks, time changes, energy shifts).
- Respond with a brief, calm, supportive text message (no shame, no fluff, just practical).
- If the user's message requires a schedule change, include an updated full plan in your response.
- When updating the plan, keep the same JSON structure and regenerate realistic time blocks.
- All times must be valid ISO 8601 datetime strings.
- Never reference past failure or what was missed.

IMPORTANT: Your response must be valid JSON with this structure:
{
  "message": "Your brief, supportive response text to the user",
  "updatedPlan": null or { full plan object with same structure as original }
}

Only include updatedPlan when the schedule actually needs to change. Set it to null for general questions or encouragement.`;

function parseJsonFromResponse(raw: string): any {
  let jsonStr = raw;
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  } else {
    const braceStart = raw.indexOf("{");
    const braceEnd = raw.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd !== -1) {
      jsonStr = raw.substring(braceStart, braceEnd + 1);
    }
  }
  return JSON.parse(jsonStr);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { mode } = body;

    // === CHAT MODE ===
    if (mode === "chat") {
      const { chatMessages, currentPlan, intakeContext } = body;

      const contextMessage = `Current time: ${new Date().toISOString()}
Current plan context:
${JSON.stringify(currentPlan, null, 2)}

Original intake context:
Deadline: ${intakeContext.deadline} at ${intakeContext.deadlineTime}
Focus method: ${intakeContext.focusMethod}
Energy level: ${intakeContext.energyLevel}/10
Top outcomes: ${JSON.stringify(intakeContext.topOutcomes)}`;

      const messages = [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "user", content: contextMessage },
        ...chatMessages.map((m: any) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        console.error("AI API error:", errText);
        throw new Error(`AI API returned ${response.status}`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonFromResponse(raw);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === PLAN / REPLAN MODE ===
    const { intake, replan } = body;

    let userMessage = "";

    if (replan) {
      userMessage = `REPLAN REQUEST — Do not reference what was missed. Just build a new plan from now.

What was completed: ${replan.completedTasks}
Remaining time available: ${replan.remainingTime}
Current energy level: ${replan.currentEnergy}/10

Original context:
`;
    }

    userMessage += `Deadline: ${intake.deadline} at ${intake.deadlineTime}
Current time: ${new Date().toISOString()}
Available working windows: ${JSON.stringify(intake.workingWindows)}
Fixed commitments: ${JSON.stringify(intake.fixedCommitments)}
Minimum sleep hours: ${intake.minSleepHours}
Focus method (work/break): ${intake.focusMethod}
Energy level: ${intake.energyLevel}/10
Brain dump: ${intake.brainDump}
Top outcomes that must be done: ${JSON.stringify(intake.topOutcomes)}
"Done enough" means: ${intake.doneEnough}

IMPORTANT: Generate a detailed, hour-by-hour schedule with specific time blocks for each working window. Every block should have exact start and end times.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PLAN_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const plan = parseJsonFromResponse(raw);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Clutch Mode error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate plan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
