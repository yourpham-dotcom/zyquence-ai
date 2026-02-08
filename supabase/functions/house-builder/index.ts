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
    const { input } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI architect that designs houses. When a user describes a house, you MUST respond by calling the generate_house tool with the appropriate parameters. Do NOT ask follow-up questions. Generate the best house matching the description immediately.

Style guide:
- "modern" = flat roofs, glass, clean lines, neutral colors
- "luxury" = modern but bigger, always has pool and balcony
- "colonial" = gable roof, warm earth tones, traditional feel
- "mediterranean" = hip roof, warm terracotta/cream colors
- "minimalist" = flat roof, simple, smaller footprint, clean whites

Also provide a short plain-text description (no markdown, no asterisks) of what you designed, highlighting key features.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_house",
              description: "Generate a 3D house model with the given parameters",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "A short plain-text summary of the house design (no markdown formatting, no asterisks)"
                  },
                  stories: {
                    type: "number",
                    description: "Number of stories (1-4)",
                    minimum: 1,
                    maximum: 4
                  },
                  width: {
                    type: "number",
                    description: "Width of the house in meters (8-20)",
                    minimum: 8,
                    maximum: 20
                  },
                  depth: {
                    type: "number",
                    description: "Depth of the house in meters (8-16)",
                    minimum: 8,
                    maximum: 16
                  },
                  style: {
                    type: "string",
                    enum: ["modern", "colonial", "mediterranean", "minimalist", "luxury"]
                  },
                  roofType: {
                    type: "string",
                    enum: ["flat", "gable", "hip"]
                  },
                  hasPool: { type: "boolean" },
                  hasGarage: { type: "boolean" },
                  hasBalcony: { type: "boolean" },
                  hasTerrace: { type: "boolean" },
                  wallColor: { type: "string", description: "Hex color for walls" },
                  accentColor: { type: "string", description: "Hex color for accents" },
                  roofColor: { type: "string", description: "Hex color for roof" },
                  trimColor: { type: "string", description: "Hex color for trim" }
                },
                required: ["description", "stories", "width", "depth", "style", "roofType", "hasPool", "hasGarage", "hasBalcony", "hasTerrace"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_house" } },
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_house") {
      // Fallback: use text response
      const textContent = data.choices?.[0]?.message?.content || "";
      return new Response(
        JSON.stringify({
          description: textContent || "Here's a default modern house design!",
          houseParams: {
            stories: 2,
            width: 12,
            depth: 10,
            style: "modern",
            roofType: "flat",
            hasPool: true,
            hasGarage: true,
            hasBalcony: true,
            hasTerrace: true,
            colorScheme: {
              walls: "#f5f0e8",
              accent: "#4a4a3a",
              roof: "#3d3d2d",
              trim: "#8b7355",
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const args = JSON.parse(toolCall.function.arguments);

    const houseParams = {
      stories: Math.min(4, Math.max(1, args.stories || 2)),
      width: Math.min(20, Math.max(8, args.width || 12)),
      depth: Math.min(16, Math.max(8, args.depth || 10)),
      style: args.style || "modern",
      roofType: args.roofType || "flat",
      hasPool: args.hasPool ?? true,
      hasGarage: args.hasGarage ?? true,
      hasBalcony: args.hasBalcony ?? true,
      hasTerrace: args.hasTerrace ?? true,
      colorScheme: {
        walls: args.wallColor || "#f5f0e8",
        accent: args.accentColor || "#4a4a3a",
        roof: args.roofColor || "#3d3d2d",
        trim: args.trimColor || "#8b7355",
      },
    };

    console.log("House generated:", JSON.stringify(houseParams));

    return new Response(
      JSON.stringify({
        description: args.description || "Your custom house has been designed!",
        houseParams,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in house-builder function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
