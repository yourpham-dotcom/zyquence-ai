import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Clutch Mode, an AI scheduling assistant for people who are starting late, feel overwhelmed, or have ADHD. Your job is to take messy, incomplete inputs and instantly build a realistic, shame-free plan optimized for momentum and completion — not perfection.

Rules:
- Assume the user is starting late. Never reference past failure.
- Remove all guilt, shame, or motivational fluff. Be calm, direct, and supportive.
- Limit the plan to a maximum of 3 major priorities.
- Break all work into 5–25 minute steps.
- Automatically include breaks, 10–20% buffer time, and a short admin/setup block at the start.
- Start with the easiest high-impact task to build momentum.
- If there is not enough time, downgrade tasks to their minimum viable version.
- All times in the schedule must be valid ISO 8601 datetime strings.
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intake, replan } = await req.json();

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
"Done enough" means: ${intake.doneEnough}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Zyquence Clutch Mode",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response, stripping any markdown fences
    let planJson: string = raw;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      planJson = jsonMatch[1].trim();
    } else {
      // Try to find raw JSON
      const braceStart = raw.indexOf("{");
      const braceEnd = raw.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) {
        planJson = raw.substring(braceStart, braceEnd + 1);
      }
    }

    const plan = JSON.parse(planJson);

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
