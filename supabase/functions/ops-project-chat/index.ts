import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, project, tasks, milestones, workflowNodes, workflowEdges } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an intelligent project operations assistant for the Zyquence Ops platform.

The user has a project with tasks, milestones, and a workflow map. They will describe last-minute changes, plan updates, or adjustments. You must analyze and return structured updates.

Current Project:
- Title: ${project.title}
- Goal: ${project.goal}
- Deadline: ${project.deadline || "None"}
- Team: ${JSON.stringify(project.team_members || [])}

Current Tasks:
${JSON.stringify(tasks, null, 2)}

Current Milestones:
${JSON.stringify(milestones, null, 2)}

Current Workflow Nodes:
${JSON.stringify(workflowNodes, null, 2)}

Current Workflow Edges:
${JSON.stringify(workflowEdges, null, 2)}

Based on the user's message, determine what needs to change and call the appropriate tool(s). You can update tasks, milestones, and workflow nodes simultaneously. Always provide a brief conversational response explaining what you did.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "apply_project_updates",
          description: "Apply updates to tasks, milestones, and workflow nodes based on user's request",
          parameters: {
            type: "object",
            properties: {
              response_message: {
                type: "string",
                description: "Brief friendly message explaining what was changed"
              },
              task_updates: {
                type: "array",
                description: "Tasks to update (by id) or new tasks to create",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["update", "create", "delete"] },
                    id: { type: "string", description: "Task ID for update/delete, omit for create" },
                    title: { type: "string" },
                    description: { type: "string" },
                    assigned_to: { type: "string" },
                    status: { type: "string", enum: ["not_started", "in_progress", "complete"] },
                    priority: { type: "string", enum: ["low", "medium", "high"] },
                    deadline: { type: "string", description: "ISO date string YYYY-MM-DD" },
                    phase: { type: "string" }
                  },
                  required: ["action"]
                }
              },
              milestone_updates: {
                type: "array",
                description: "Milestones to update or create",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["update", "create", "delete"] },
                    id: { type: "string" },
                    title: { type: "string" },
                    target_date: { type: "string" },
                    is_completed: { type: "boolean" }
                  },
                  required: ["action"]
                }
              },
              workflow_updates: {
                type: "array",
                description: "Workflow nodes to update or create",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["update", "create", "delete"] },
                    id: { type: "string" },
                    label: { type: "string" },
                    description: { type: "string" },
                    owner: { type: "string" },
                    status: { type: "string", enum: ["pending", "in_progress", "complete", "blocked"] },
                    node_type: { type: "string", enum: ["start", "step", "decision", "end"] }
                  },
                  required: ["action"]
                }
              }
            },
            required: ["response_message"],
            additionalProperties: false
          }
        }
      }
    ];

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
        tools,
        tool_choice: { type: "function", function: { name: "apply_project_updates" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let parsed;
    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch {
        parsed = { response_message: "I understood your request but had trouble formatting the response. Please try again.", error: true };
      }
    } else {
      const content = data.choices?.[0]?.message?.content || "";
      parsed = { response_message: content || "I couldn't process that request. Please try again." };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ops-project-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
