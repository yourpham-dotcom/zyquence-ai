import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_MAP: Record<string, string> = {
  ceo: "c_suite", coo: "c_suite", cfo: "c_suite", cto: "c_suite",
  cmo: "c_suite", cro: "c_suite", cio: "c_suite", cpo: "c_suite",
  "chief executive officer": "c_suite", "chief operating officer": "c_suite",
  "chief financial officer": "c_suite", "chief technology officer": "c_suite",
  "chief marketing officer": "c_suite", "chief revenue officer": "c_suite",
  vp: "leadership", "vice president": "leadership", director: "leadership",
  "head of": "leadership", "senior director": "leadership",
  manager: "manager", lead: "manager", supervisor: "manager",
  "team lead": "manager", contractor: "contractor", freelancer: "contractor",
  intern: "employee", associate: "employee", analyst: "employee",
  engineer: "employee", designer: "employee", specialist: "employee",
};

function classifyTier(title: string): string {
  const lower = title.toLowerCase();
  // Check C-Suite first (starts with "C" pattern or exact matches)
  if (/^c[a-z]o$/i.test(lower) || /^chief\s/i.test(lower)) return "c_suite";
  for (const [key, tier] of Object.entries(TIER_MAP)) {
    if (lower.includes(key)) return tier;
  }
  return "employee";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, teamMembers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are OrgOS, an organization management AI. Parse natural language commands about team structure.

Current team members: ${JSON.stringify(teamMembers || [])}

Return a JSON object with:
{
  "action": "add" | "update" | "delete" | "bulk_add" | "info",
  "members": [{ "name": "...", "title": "...", "department": "...", "manager_name": "..." }],
  "update_id": "uuid if updating existing member",
  "delete_id": "uuid if deleting",
  "reply": "Human-friendly confirmation message"
}

Rules:
- For "John is CEO": action=add/update, title=CEO, department=Executive
- For "Move X to Y": action=update
- For "Promote X to Y": action=update with new title
- For "Remove X": action=delete
- For "Create team of N": action=bulk_add with generated names/titles
- If updating existing member, include their id as update_id
- Assign logical departments based on title (e.g., CFO→Finance, CTO→Technology, Marketing Director→Marketing)
- For info/questions: action=info with reply only

Always respond with valid JSON only, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { action: "info", reply: content }; }

    // Enrich with tier classification
    if (parsed.members) {
      parsed.members = parsed.members.map((m: any) => ({
        ...m,
        tier_level: classifyTier(m.title || "Employee"),
      }));
    }

    // Execute database operations
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (parsed.action === "add" || parsed.action === "bulk_add") {
      for (const m of parsed.members || []) {
        // Check if member already exists by name
        const { data: existing } = await supabase
          .from("team_members")
          .select("id")
          .eq("name", m.name)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from("team_members").update({
            title: m.title,
            department: m.department || "General",
            tier_level: m.tier_level,
          }).eq("id", existing.id);
        } else {
          // Resolve manager
          let managerId = null;
          if (m.manager_name) {
            const { data: mgr } = await supabase
              .from("team_members")
              .select("id")
              .eq("name", m.manager_name)
              .eq("user_id", user.id)
              .maybeSingle();
            if (mgr) managerId = mgr.id;
          }

          await supabase.from("team_members").insert({
            user_id: user.id,
            name: m.name,
            title: m.title || "Employee",
            department: m.department || "General",
            tier_level: m.tier_level || "employee",
            manager_id: managerId,
          });
        }
      }
    } else if (parsed.action === "update" && parsed.update_id) {
      const updates: any = {};
      const m = parsed.members?.[0];
      if (m?.title) { updates.title = m.title; updates.tier_level = classifyTier(m.title); }
      if (m?.department) updates.department = m.department;
      if (Object.keys(updates).length) {
        await supabase.from("team_members").update(updates).eq("id", parsed.update_id);
      }
    } else if (parsed.action === "update" && parsed.members?.length) {
      // Update by name match
      for (const m of parsed.members) {
        const { data: existing } = await supabase
          .from("team_members")
          .select("id")
          .eq("user_id", user.id)
          .ilike("name", m.name)
          .maybeSingle();
        if (existing) {
          const updates: any = {};
          if (m.title) { updates.title = m.title; updates.tier_level = classifyTier(m.title); }
          if (m.department) updates.department = m.department;
          await supabase.from("team_members").update(updates).eq("id", existing.id);
        } else {
          // Create if doesn't exist
          await supabase.from("team_members").insert({
            user_id: user.id,
            name: m.name,
            title: m.title || "Employee",
            department: m.department || "General",
            tier_level: m.tier_level || classifyTier(m.title || "Employee"),
          });
        }
      }
    } else if (parsed.action === "delete") {
      if (parsed.delete_id) {
        await supabase.from("team_members").delete().eq("id", parsed.delete_id);
      } else if (parsed.members?.[0]?.name) {
        await supabase.from("team_members").delete()
          .eq("user_id", user.id)
          .ilike("name", parsed.members[0].name);
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("orgos-chat error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
