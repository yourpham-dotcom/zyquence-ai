import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function classifyTier(title: string): string {
  const lower = title.toLowerCase();
  if (/^c[a-z]o$/i.test(lower) || /^chief\s/i.test(lower)) return "c_suite";
  if (/\b(ceo|coo|cfo|cto|cmo|cro|cio|cpo)\b/i.test(lower)) return "c_suite";
  if (/\b(vp|vice president|director|head of|senior director)\b/i.test(lower)) return "leadership";
  if (/\b(manager|lead|supervisor|team lead)\b/i.test(lower)) return "manager";
  if (/\b(contractor|freelancer)\b/i.test(lower)) return "contractor";
  return "employee";
}

function classifyEntityType(title: string, context: string): string {
  const lower = (title + " " + context).toLowerCase();
  if (/\b(player|athlete|prospect|draft|nba|nfl|mlb|mls|soccer player|basketball player|football player)\b/.test(lower)) return "athlete";
  if (/\b(client|customer|account)\b/.test(lower)) return "client";
  return "employee";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, teamMembers, assignments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are OrgOS, an intelligent organization management AI that supports both traditional businesses AND performance teams (trainers, coaches, sports organizations, agencies).

Current team members: ${JSON.stringify(teamMembers || [])}
Current client assignments: ${JSON.stringify(assignments || [])}

Return a JSON object with:
{
  "action": "add" | "update" | "delete" | "bulk_add" | "assign" | "unassign" | "info",
  "members": [{ "name": "...", "title": "...", "department": "...", "manager_name": "...", "entity_type": "employee|leadership|contractor|client|athlete|customer", "goals": "...", "notes": "..." }],
  "update_id": "uuid if updating existing member",
  "delete_id": "uuid if deleting",
  "assignment": { "client_name": "...", "staff_name": "...", "role": "...", "responsibilities": "..." },
  "reply": "Human-friendly confirmation message"
}

Entity types:
- employee: Regular staff
- leadership: Directors, VPs, C-Suite
- contractor: Freelancers, contractors
- client: Business clients, customers
- athlete: Players, athletes, prospects
- customer: End customers

Rules:
- For "John is CEO": action=add, entity_type=employee (staff), tier by title
- For "Player A is an NBA Player": action=add, entity_type=athlete
- For "Add client John Smith": action=add, entity_type=client
- For "John is shooting coach for Player A": action=assign, assignment with client_name=Player A, staff_name=John, role=Shooting Coach
- For "Create performance team for Player A": action=bulk_add with coaches/trainers, then assign
- For "Move X to Y": action=update
- For "Remove X": action=delete
- For role assignments like "Assign X as Y for Z": action=assign
- For task routing: mention the assigned staff role in reply
- Assign logical departments based on title
- For info/questions: action=info

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
        entity_type: m.entity_type || classifyEntityType(m.title || "", m.name || ""),
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
        const { data: existing } = await supabase
          .from("team_members")
          .select("id")
          .eq("user_id", user.id)
          .ilike("name", m.name)
          .maybeSingle();

        if (existing) {
          await supabase.from("team_members").update({
            title: m.title,
            department: m.department || "General",
            tier_level: m.tier_level,
            entity_type: m.entity_type || "employee",
            goals: m.goals || null,
            notes: m.notes || null,
          }).eq("id", existing.id);
        } else {
          let managerId = null;
          if (m.manager_name) {
            const { data: mgr } = await supabase
              .from("team_members")
              .select("id")
              .eq("user_id", user.id)
              .ilike("name", m.manager_name)
              .maybeSingle();
            if (mgr) managerId = mgr.id;
          }

          await supabase.from("team_members").insert({
            user_id: user.id,
            name: m.name,
            title: m.title || "Employee",
            department: m.department || "General",
            tier_level: m.tier_level || "employee",
            entity_type: m.entity_type || "employee",
            manager_id: managerId,
            goals: m.goals || null,
            notes: m.notes || null,
          });
        }
      }
    } else if (parsed.action === "update" && parsed.update_id) {
      const updates: any = {};
      const m = parsed.members?.[0];
      if (m?.title) { updates.title = m.title; updates.tier_level = classifyTier(m.title); }
      if (m?.department) updates.department = m.department;
      if (m?.entity_type) updates.entity_type = m.entity_type;
      if (m?.goals) updates.goals = m.goals;
      if (m?.notes) updates.notes = m.notes;
      if (Object.keys(updates).length) {
        await supabase.from("team_members").update(updates).eq("id", parsed.update_id);
      }
    } else if (parsed.action === "update" && parsed.members?.length) {
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
          if (m.entity_type) updates.entity_type = m.entity_type;
          if (m.goals) updates.goals = m.goals;
          if (m.notes) updates.notes = m.notes;
          await supabase.from("team_members").update(updates).eq("id", existing.id);
        } else {
          await supabase.from("team_members").insert({
            user_id: user.id,
            name: m.name,
            title: m.title || "Employee",
            department: m.department || "General",
            tier_level: m.tier_level || classifyTier(m.title || "Employee"),
            entity_type: m.entity_type || "employee",
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
    } else if (parsed.action === "assign" && parsed.assignment) {
      const a = parsed.assignment;
      // Find client
      const { data: client } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", a.client_name)
        .maybeSingle();

      // Find staff
      const { data: staff } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", a.staff_name)
        .maybeSingle();

      if (client && staff) {
        // Check if assignment exists
        const { data: existing } = await supabase
          .from("client_assignments")
          .select("id")
          .eq("client_id", client.id)
          .eq("staff_id", staff.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from("client_assignments").update({
            role: a.role || "Staff",
            responsibilities: a.responsibilities || null,
          }).eq("id", existing.id);
        } else {
          await supabase.from("client_assignments").insert({
            user_id: user.id,
            client_id: client.id,
            staff_id: staff.id,
            role: a.role || "Staff",
            responsibilities: a.responsibilities || null,
          });
        }
      } else {
        parsed.reply = (parsed.reply || "") + (client ? "" : ` Could not find "${a.client_name}".`) + (staff ? "" : ` Could not find "${a.staff_name}".`);
      }
    } else if (parsed.action === "unassign" && parsed.assignment) {
      const a = parsed.assignment;
      const { data: client } = await supabase
        .from("team_members").select("id").eq("user_id", user.id).ilike("name", a.client_name).maybeSingle();
      const { data: staff } = await supabase
        .from("team_members").select("id").eq("user_id", user.id).ilike("name", a.staff_name).maybeSingle();
      if (client && staff) {
        await supabase.from("client_assignments").delete()
          .eq("client_id", client.id).eq("staff_id", staff.id).eq("user_id", user.id);
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
