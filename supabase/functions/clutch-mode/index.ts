import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_SYSTEM_PROMPT = `You are Clutch Mode, an AI scheduling assistant for people who are starting late, feel overwhelmed, or have ADHD. Your job is to take messy, incomplete inputs and instantly build a realistic, shame-free plan optimized for momentum and completion — not perfection.

CRITICAL RULES FOR ACCURACY:
- You will be given the EXACT current time and deadline. Calculate the REAL time available.
- You will be given SPECIFIC working windows with dates and times. ONLY schedule within those windows. NEVER schedule work outside the provided windows.
- If there are fixed commitments, NEVER overlap with them.
- All schedule block times MUST fall within the provided working windows. Double-check every single time block.
- Use the user's chosen focus method to size work blocks (e.g., 25/5 means 25 min work then 5 min break).
- If the user's energy is low (1-4), front-load easier tasks and add more breaks. If high (7-10), allow longer focus blocks.
- Respect minimum sleep hours — do not schedule work during sleep time.
- Calculate total available minutes from working windows, subtract breaks/buffers, then allocate tasks realistically. If tasks exceed available time, explicitly say so and downgrade to minimum viable versions.
- Limit the plan to a maximum of 3 major priorities.
- Break all work into 5–25 minute steps.
- Include a 5-10 minute admin/setup block at the start of each working window.
- Add 10-20% buffer time distributed across the schedule.
- Start with the easiest high-impact task to build momentum.
- Remove all guilt, shame, or motivational fluff. Be calm, direct, and supportive.
- All times in the schedule MUST be valid ISO 8601 datetime strings using the SAME timezone offset as the current time provided.
- Output ONLY valid JSON with no markdown formatting, no code fences, no extra text.

Output format (strict JSON):
{
  "summary": "Calm, reassuring overview: mention how many hours are available and what will get done",
  "topPriorities": [
    { "task": "Task name", "reason": "Why it matters now", "estimatedMinutes": 45 }
  ],
  "scheduleBlocks": [
    { "startTime": "ISO datetime", "endTime": "ISO datetime", "label": "Specific activity description", "type": "work | break | admin | buffer" }
  ],
  "next60Minutes": [
    { "step": "Small concrete action", "minutes": 10 }
  ],
  "twoMinuteStart": "A 2-minute action that lowers resistance and gets started",
  "ifBehindPlan": ["Clear, shame-free instructions for replanning"],
  "notes": ["Supportive, practical reminders"]
}`;

const CHAT_SYSTEM_PROMPT = `You are the Clutch Mode assistant. The user has an active schedule plan and is chatting with you to adjust it on the fly.

CRITICAL RULES:
- Listen to last-minute changes (new tasks, cancelled blocks, time changes, energy shifts).
- Respond with a brief, calm, supportive text message (no shame, no fluff, just practical).
- If the user's message requires a schedule change, regenerate the FULL plan with accurate time blocks.
- When updating, recalculate all times precisely. Every schedule block must have valid ISO 8601 datetimes.
- Schedule blocks must only fall within the original working windows — never outside them.
- Never reference past failure or what was missed.
- Use the user's focus method to size work/break blocks correctly.

IMPORTANT: Your response must be valid JSON with this structure:
{
  "message": "Your brief, supportive response text to the user",
  "updatedPlan": null or { full plan object with same structure as original }
}

Only include updatedPlan when the schedule actually needs to change. Set it to null for general questions or encouragement.
Output ONLY valid JSON. No markdown, no code fences.`;

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

      const workingWindowsText = (intakeContext.workingWindows || [])
        .filter((w: any) => w.date)
        .map((w: any) => `  - ${w.date}: ${w.startTime} to ${w.endTime}`)
        .join("\n") || "  Not specified";

      const contextMessage = `Current time: ${new Date().toISOString()}
Deadline: ${intakeContext.deadline} at ${intakeContext.deadlineTime}
Focus method: ${intakeContext.focusMethod}
Energy level: ${intakeContext.energyLevel}/10
Top outcomes: ${intakeContext.topOutcomes?.join(", ")}
Working windows:
${workingWindowsText}

Current active plan:
${JSON.stringify(currentPlan, null, 2)}

IMPORTANT: When regenerating schedule blocks, times MUST fall within the working windows above and use valid ISO 8601 datetimes.`;

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
          model: "google/gemini-3-flash-preview",
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
    const now = new Date();
    const currentTimeISO = now.toISOString();

    // Format working windows into human-readable text for clarity
    const formattedWindows = intake.workingWindows
      .filter((w: any) => w.date)
      .map((w: any) => `  - ${w.date}: ${w.startTime} to ${w.endTime}`)
      .join("\n");

    const formattedCommitments = intake.fixedCommitments.length > 0
      ? intake.fixedCommitments
          .map((c: any) => `  - "${c.label}" on ${c.date}: ${c.startTime} to ${c.endTime}`)
          .join("\n")
      : "  None";

    const formattedOutcomes = intake.topOutcomes
      .filter((o: string) => o.trim())
      .map((o: string, i: number) => `  ${i + 1}. ${o}`)
      .join("\n");

    if (replan) {
      userMessage = `REPLAN REQUEST — Do not reference what was missed. Just build a new plan from NOW.

What was completed so far: ${replan.completedTasks}
Remaining time available: ${replan.remainingTime}
Current energy level: ${replan.currentEnergy}/10

Original context below:
`;
    }

    userMessage += `=== TIMING ===
Current time (right now): ${currentTimeISO}
Deadline: ${intake.deadline} at ${intake.deadlineTime}

=== AVAILABLE WORKING WINDOWS (ONLY schedule within these) ===
${formattedWindows || "  No specific windows provided — use reasonable daytime hours"}

=== FIXED COMMITMENTS (DO NOT overlap) ===
${formattedCommitments}

=== PREFERENCES ===
Minimum sleep: ${intake.minSleepHours} hours
Focus method: ${intake.focusMethod} (work minutes / break minutes)
Energy level: ${intake.energyLevel}/10

=== BRAIN DUMP (everything on their mind) ===
${intake.brainDump}

=== TOP OUTCOMES (must happen by deadline) ===
${formattedOutcomes}

=== "DONE ENOUGH" DEFINITION ===
${intake.doneEnough}

INSTRUCTIONS:
1. Calculate total available working minutes from the windows above.
2. Subtract time for breaks (using the ${intake.focusMethod} pattern), buffer (10-20%), and admin/setup blocks.
3. Fit the top outcomes into the remaining time. If they don't fit, downgrade to minimum viable versions and say so.
4. Generate schedule blocks with EXACT ISO 8601 datetime strings that fall WITHIN the working windows.
5. The "next60Minutes" section should reflect what to do in the next 60 minutes from ${currentTimeISO}.
6. Double-check: no block starts before a window opens or ends after a window closes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
