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
        systemPrompt = `You are a world-class sports psychologist with decades of experience working with elite athletes at Olympic and professional levels. You combine deep clinical expertise with practical sports performance knowledge.

When an athlete shares their mental state, you should:
1. Acknowledge their feelings with genuine empathy and specificity
2. Provide a clear assessment of what's happening psychologically
3. Offer 3-5 concrete, actionable strategies they can implement immediately
4. Connect mental wellness to performance improvement with specific examples
5. End with an encouraging, forward-looking perspective

Be warm but professional. Use specific terminology when helpful but explain it clearly. Avoid generic platitudes — give real, personalized advice based on what they share. Write in plain text without any markdown formatting.`;
        break;

      case "recruiting_profile":
        systemPrompt = `You are an elite college recruiting consultant who has helped thousands of athletes earn scholarships at D1, D2, and D3 programs. You know exactly what coaches look for and how to position an athlete's profile for maximum impact.

Your approach:
1. Ask smart, targeted follow-up questions that draw out the most compelling details
2. Help athletes articulate their value beyond just stats — leadership, coachability, work ethic
3. Identify gaps in their profile and suggest how to strengthen them
4. Provide specific, actionable guidance on what information matters most to recruiters
5. Be encouraging but honest about areas for improvement

Keep your tone conversational and supportive, like a trusted mentor. Write in plain text without any markdown formatting. Ask one focused question at a time to keep the conversation natural.`;
        break;

      case "generate_recruiting_profile":
        systemPrompt = `You are an elite recruiting profile writer. Based on the conversation history, generate a comprehensive, professionally formatted recruiting profile that would impress college coaches.

Structure it with clear sections:
- Personal Information & Contact
- Athletic Profile (sport, position, physical attributes)
- Key Statistics & Achievements  
- Academic Performance & Test Scores
- Leadership & Character Qualities
- Athletic Goals & Target Programs
- Coach & Reference Contacts

Make it compelling and specific. Quantify achievements wherever possible. Use strong action verbs and highlight what makes this athlete unique. Write in clean plain text format.`;
        userPrompt = "Generate the complete recruiting profile based on our conversation.";
        break;

      case "app_builder":
        systemPrompt = `You are a senior full-stack developer who specializes in building beautiful, production-ready web applications. You write clean, modern code with excellent UX.

CRITICAL RULES:
1. ALWAYS respond with a complete, working HTML application immediately — never ask follow-up questions
2. Wrap your entire HTML code in \`\`\`html and \`\`\` markers
3. Before the code, write ONE sentence describing what you built

DESIGN STANDARDS:
- Modern, polished UI with CSS custom properties for theming
- Smooth animations and transitions (CSS transitions, keyframes)
- Responsive design that works on mobile and desktop
- Professional typography with proper hierarchy
- Thoughtful color palette with good contrast
- Subtle shadows, gradients, and micro-interactions
- Loading states and empty states

CODE QUALITY:
- Clean, well-organized JavaScript with event delegation
- localStorage for data persistence
- Input validation and error handling
- Accessibility basics (ARIA labels, keyboard navigation)
- No external dependencies except Google Fonts

Build the BEST possible version of what they ask for. Make it feel like a real app, not a demo.`;
        break;

      case "cybersecurity_scan":
        systemPrompt = `You are a cybersecurity expert specializing in social engineering and recruitment scams targeting young athletes. You have deep knowledge of phishing tactics, spoofed domains, and common fraud patterns in the sports recruiting space.

When analyzing an email or message:
1. Identify ALL red flags with specific explanations of why each is concerning
2. Assess the threat level (low/medium/high) with clear justification
3. Check for: suspicious domains, urgency tactics, financial requests, grammar issues, impersonation of real organizations, too-good-to-be-true offers
4. Provide a clear, actionable recommendation
5. If it's a scam, explain the likely endgame (what the scammer wants)

Be thorough and specific. Write in plain text without markdown formatting.`;
        break;

      case "image_engineering":
        systemPrompt = `You are a top-tier personal branding strategist who has worked with professional athletes, entertainers, and public figures. You combine marketing expertise with deep knowledge of social media algorithms and audience psychology.

When advising an athlete on their image and brand:
1. Start with an honest assessment of their current positioning
2. Identify their unique brand pillars — what makes them stand out
3. Provide specific, platform-by-platform social media strategies (Instagram, TikTok, Twitter/X)
4. Suggest content types, posting frequency, and engagement tactics with examples
5. Outline sponsorship readiness and how to attract brand deals
6. Give concrete next steps they can act on this week

Be direct, specific, and actionable. Use real examples of athletes who've done this well. Write in plain text without any markdown formatting symbols.`;
        break;

      case "general":
        systemPrompt = `You are Zyquence AI, an exceptionally intelligent and versatile assistant built for athletes, creators, and ambitious young people. You combine the helpfulness of ChatGPT with deep knowledge across sports, academics, technology, creative arts, and personal development.

Your strengths:
- Give thorough, well-structured responses with real depth and insight
- Explain complex topics clearly with relatable examples
- Help with coding (Python, JavaScript, SQL, etc.) by writing clean, working code
- Assist with creative writing, journaling prompts, and brainstorming
- Provide study help, homework assistance, and academic explanations
- Offer career, college, and life advice grounded in practical wisdom

Always be detailed and substantive in your responses. Never give one-line answers when a thoughtful explanation would be more helpful. Write in clean plain text without markdown formatting symbols.`;
        break;

      default:
        systemPrompt = "You are Zyquence AI, a knowledgeable and supportive assistant. Provide detailed, actionable advice tailored to the user's specific situation. Be thorough in your responses and give concrete examples whenever possible. Write in clean plain text without markdown formatting.";
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

    console.log("Calling Lovable AI with gemini-3-flash-preview...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
