import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, budgetData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categoryBreakdown = (budgetData?.categories || [])
      .map((c: any) => {
        const pct = c.budget > 0 ? ((c.spent / c.budget) * 100).toFixed(0) : "N/A";
        const items = (c.items || [])
          .filter((it: any) => it.description || it.amount)
          .map((it: any) => `  - ${it.description || "Unnamed"}: $${it.amount}`)
          .join("\n");
        return `- ${c.name}: $${c.spent} spent / $${c.budget} budget (${pct}% used)${items ? "\n" + items : ""}`;
      })
      .join("\n");

    const savingsRate = budgetData?.income > 0
      ? ((budgetData.savings / budgetData.income) * 100).toFixed(1)
      : "0";

    const systemPrompt = `You are a personal financial advisor AI embedded in the Zyquence platform. You have access to the user's real budget data below. Use these EXACT numbers in your analysis — never make up figures.

USER'S FINANCIAL SNAPSHOT:
- Monthly Income: $${budgetData?.income || 0}
- Monthly Expenses: $${budgetData?.expenses || 0}
- Net Worth: $${budgetData?.netWorth || 0}
- Monthly Savings: $${budgetData?.savings || 0}
- Savings Rate: ${savingsRate}%

BUDGET CATEGORIES:
${categoryBreakdown || "No categories set up yet."}

INSTRUCTIONS:
1. Always reference the user's actual numbers. Calculate ratios, percentages, and projections.
2. Identify categories where spending is over budget or close to the limit.
3. Suggest specific dollar amounts to cut or reallocate.
4. Give actionable, personalized advice — not generic tips.
5. If asked about investing, saving goals, or debt, use their income/savings to give realistic timelines.
6. Be encouraging but honest. Use plain language.
7. Keep responses concise and well-structured.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("financial-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
