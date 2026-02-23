import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;

    const { message, inventory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an inventory management assistant. You help users manage their inventory by interpreting natural language commands.

Given the user's current inventory (JSON array below), interpret their message and return a JSON response with the action to take.

Current inventory:
${JSON.stringify(inventory || [], null, 2)}

You MUST respond with valid JSON in this exact format:
{
  "action": "add" | "update" | "delete" | "info",
  "items": [
    {
      "id": "uuid or null for new items",
      "name": "item name",
      "category": "category",
      "quantity": number,
      "unit": "pcs/kg/lbs/etc",
      "unit_price": number,
      "sku": "optional sku",
      "location": "optional location",
      "min_stock": number,
      "notes": "optional notes"
    }
  ],
  "message": "A friendly confirmation message describing what you did"
}

Rules:
- For "add": create new items. Set id to null.
- For "update": modify existing items. Include the id from the current inventory. Only include fields that changed plus the id.
- For "delete": remove items. Include just the id and name.
- For "info": no items changes, just answer the question in "message".
- When updating quantity, if user says "add 5 more", increase the current quantity by 5.
- If user says "set quantity to 10", set it exactly to 10.
- Be smart about matching item names (fuzzy match).
- Always respond with valid JSON only, no markdown.`;

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
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse AI response - strip markdown code fences if present
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ action: "info", items: [], message: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Execute the action
    const results: any[] = [];

    if (parsed.action === "add" && parsed.items?.length) {
      for (const item of parsed.items) {
        const { data, error } = await supabase.from("inventory_items").insert({
          user_id: userId,
          name: item.name,
          category: item.category || "General",
          quantity: item.quantity || 0,
          unit: item.unit || "pcs",
          unit_price: item.unit_price || 0,
          sku: item.sku || null,
          location: item.location || null,
          min_stock: item.min_stock || 0,
          notes: item.notes || null,
        }).select().single();
        if (error) results.push({ error: error.message, item: item.name });
        else results.push(data);
      }
    } else if (parsed.action === "update" && parsed.items?.length) {
      for (const item of parsed.items) {
        if (!item.id) continue;
        const updates: any = {};
        if (item.name !== undefined) updates.name = item.name;
        if (item.category !== undefined) updates.category = item.category;
        if (item.quantity !== undefined) updates.quantity = item.quantity;
        if (item.unit !== undefined) updates.unit = item.unit;
        if (item.unit_price !== undefined) updates.unit_price = item.unit_price;
        if (item.sku !== undefined) updates.sku = item.sku;
        if (item.location !== undefined) updates.location = item.location;
        if (item.min_stock !== undefined) updates.min_stock = item.min_stock;
        if (item.notes !== undefined) updates.notes = item.notes;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from("inventory_items").update(updates).eq("id", item.id).select().single();
        if (error) results.push({ error: error.message, item: item.name });
        else results.push(data);
      }
    } else if (parsed.action === "delete" && parsed.items?.length) {
      for (const item of parsed.items) {
        if (!item.id) continue;
        const { error } = await supabase.from("inventory_items").delete().eq("id", item.id);
        if (error) results.push({ error: error.message, item: item.name });
        else results.push({ deleted: true, id: item.id, name: item.name });
      }
    }

    return new Response(JSON.stringify({
      action: parsed.action,
      message: parsed.message,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("inventory-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
