import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, type, conversationHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = input;

    // Different prompts based on feature type
    switch (type) {
      case "mental_health":
        systemPrompt = "You are a sports psychologist specializing in athlete mental health and performance. Analyze the athlete's mental state, provide insights on their wellbeing, suggest coping strategies, and offer actionable advice for improving mental resilience and performance. Be empathetic, professional, and supportive.";
        break;

      case "recruiting_profile":
        systemPrompt = "You are a college recruiting expert. Help athletes build compelling recruiting profiles by asking targeted questions about their sport, achievements, academics, and goals. Guide them through the process conversationally and provide constructive feedback.";
        break;

      case "generate_recruiting_profile":
        systemPrompt = "Based on the conversation history, generate a comprehensive recruiting profile in a professional format. Include sections for: Personal Information, Athletic Statistics, Key Achievements, Academic Performance, Leadership & Character, and Career Goals. Format it professionally.";
        userPrompt = "Generate the complete recruiting profile based on our conversation.";
        break;

      case "app_builder":
        systemPrompt = `You are an AI app builder for athletes. When a user asks you to build an app, you MUST immediately generate a COMPLETE, fully functional single-page HTML application. Do NOT ask any follow-up questions. Do NOT ask for clarification. Just build the best version of what they asked for right away.

CRITICAL RULES:
1. ALWAYS respond with a complete HTML app - never ask questions first
2. Your response must contain a working HTML document with embedded CSS and JavaScript
3. Wrap your entire HTML code in \`\`\`html and \`\`\` markers
4. Make the app visually polished with modern CSS (gradients, shadows, rounded corners, animations)
5. Make it fully interactive with JavaScript
6. Use a dark theme with accent colors
7. Make it mobile-responsive
8. Include sample/placeholder data so the app looks complete
9. Before the code, write a single short sentence describing what you built
10. The app should be self-contained - no external dependencies except Google Fonts which you can link`;
        break;

      case "cybersecurity_scan":
        systemPrompt = "You are a cybersecurity expert specializing in sports recruitment scams. Analyze emails for red flags like suspicious domains, poor grammar, urgent financial requests, unofficial email addresses, or too-good-to-be-true offers. Provide a threat level (low, medium, high), list specific red flags found, and give clear recommendations.";
        break;

      case "image_engineering":
        systemPrompt = "You are a sports marketing and personal branding consultant. Analyze athletes' current image, social media presence, and goals. Provide strategic advice on building their personal brand, increasing marketability, growing social media engagement, and attracting sponsorships. Be specific and actionable.";
        break;

      default:
        systemPrompt = "You are a helpful AI assistant for athletes.";
    }

    // Build messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({ role: "user", content: userPrompt });

    console.log("Calling Lovable AI...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response generated");
    }

    // Return formatted response based on type
    let result: any = {};

    switch (type) {
      case "mental_health":
        result = { analysis: aiResponse };
        break;

      case "recruiting_profile":
        result = { response: aiResponse };
        break;

      case "generate_recruiting_profile":
        result = { profile: aiResponse };
        break;

      case "app_builder": {
        // Extract HTML code from response if present
        const htmlMatch = aiResponse.match(/```html\n?([\s\S]*?)```/);
        if (htmlMatch) {
          const description = aiResponse.split("```html")[0].trim();
          result = { 
            response: description || "Here's your app! Opening it in a new tab now.", 
            appCode: htmlMatch[1].trim() 
          };
        } else {
          result = { response: aiResponse };
        }
        break;
      }

      case "cybersecurity_scan":
        // Try to parse structured response
        try {
          const parsed = JSON.parse(aiResponse);
          result = parsed;
        } catch {
          // Fallback to text analysis
          const threatLevel = aiResponse.toLowerCase().includes("high risk") || aiResponse.toLowerCase().includes("scam") 
            ? "high" 
            : aiResponse.toLowerCase().includes("suspicious") 
            ? "medium" 
            : "low";
          
          result = {
            threatLevel,
            analysis: aiResponse,
            recommendation: threatLevel === "high" 
              ? "Do not respond to this email. Report it immediately." 
              : threatLevel === "medium"
              ? "Proceed with caution. Verify sender through official channels."
              : "Email appears legitimate, but always verify important details."
          };
        }
        break;

      case "image_engineering":
        // Try to parse structured response
        try {
          const parsed = JSON.parse(aiResponse);
          result = parsed;
        } catch {
          result = { overview: aiResponse };
        }
        break;

      default:
        result = { response: aiResponse };
    }

    console.log("Processing successful");
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in athlete-mental-coach function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
