import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { trade, trades, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let prompt: string;

    if (type === "portfolio" && trades) {
      prompt = `You are an expert trading coach. Analyze these recent trades and provide portfolio-level insights:

${JSON.stringify(trades, null, 2)}

Provide:
1. Overall trading patterns you notice
2. Psychological tendencies (based on emotions and confidence levels)
3. Strategy effectiveness analysis
4. Common mistakes and how to fix them
5. Specific actionable recommendations

Keep it concise, direct, and actionable. Be honest but encouraging.`;
    } else if (trade) {
      prompt = `You are an expert trading coach. Analyze this trade and provide constructive feedback:

Symbol: ${trade.symbol}
Type: ${trade.trade_type}
Entry: $${trade.entry_price}
Exit: ${trade.exit_price ? `$${trade.exit_price}` : "Still open"}
P/L: ${trade.profit_loss !== null ? `$${trade.profit_loss}` : "N/A"}
Strategy: ${trade.strategy_used || "Not specified"}
Timeframe: ${trade.timeframe}
Confidence: ${trade.confidence_level}/10
Emotion Before: ${trade.emotion_before || "N/A"}
Emotion After: ${trade.emotion_after || "N/A"}
Setup: ${trade.setup_description || "N/A"}
Mistakes: ${trade.mistakes_made || "N/A"}
What went well: ${trade.what_went_well || "N/A"}
What went wrong: ${trade.what_went_wrong || "N/A"}
Lesson learned: ${trade.lesson_learned || "N/A"}

Provide brief, constructive feedback covering:
1. Trade execution assessment
2. Psychology insights
3. One specific improvement suggestion

Keep it under 200 words. Be direct and actionable.`;
    } else {
      throw new Error("Invalid request");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional trading coach providing educational analysis. Always include a disclaimer that this is not financial advice." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content || "Unable to generate feedback.";

    return new Response(JSON.stringify({ feedback }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("trade-reflection error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
