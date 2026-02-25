import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  updates?: {
    tasks?: number;
    milestones?: number;
    workflow?: number;
  };
};

type ProjectChatbotProps = {
  project: {
    id: string;
    title: string;
    goal: string;
    deadline: string | null;
    team_members: string[];
  };
  tasks: { id: string; title: string; description: string | null; assigned_to: string | null; status: string; priority: string; deadline: string | null; phase: string | null }[];
  milestones: { id: string; title: string; target_date: string | null; is_completed: boolean; project_id: string }[];
  workflowNodes: { id: string; label: string; description?: string | null; owner?: string | null; status: string; node_type: string; project_id: string }[];
  workflowEdges: { id: string; source_node_id: string; target_node_id: string; label?: string | null; project_id: string }[];
  onUpdatesApplied: (result: any) => Promise<void>;
};

const SUGGESTIONS = [
  "Push everything back 2 days",
  "Mark all preparation tasks as complete",
  "Add a quality check step before launch",
  "Reassign all tasks from Will to Kunal",
  "I need to cancel Friday, move to Saturday",
];

export function ProjectChatbot({ project, tasks, milestones, workflowNodes, workflowEdges, onUpdatesApplied }: ProjectChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ops-project-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          message: userMsg,
          project: {
            title: project.title,
            goal: project.goal,
            deadline: project.deadline,
            team_members: project.team_members,
          },
          tasks: tasks.map(t => ({ id: t.id, title: t.title, description: t.description, assigned_to: t.assigned_to, status: t.status, priority: t.priority, deadline: t.deadline, phase: t.phase })),
          milestones: milestones.map(m => ({ id: m.id, title: m.title, target_date: m.target_date, is_completed: m.is_completed })),
          workflowNodes: workflowNodes.map(n => ({ id: n.id, label: n.label, description: n.description, owner: n.owner, status: n.status, node_type: n.node_type })),
          workflowEdges: workflowEdges.map(e => ({ id: e.id, source_node_id: e.source_node_id, target_node_id: e.target_node_id, label: e.label })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      const updateCounts = {
        tasks: (result.task_updates || []).length,
        milestones: (result.milestone_updates || []).length,
        workflow: (result.workflow_updates || []).length,
      };

      setMessages(prev => [...prev, {
        role: "assistant",
        content: result.response_message,
        updates: updateCounts.tasks + updateCounts.milestones + updateCounts.workflow > 0 ? updateCounts : undefined,
      }]);

      // Apply updates
      await onUpdatesApplied(result);

      const totalChanges = updateCounts.tasks + updateCounts.milestones + updateCounts.workflow;
      if (totalChanges > 0) {
        toast({ title: "Project updated", description: `${totalChanges} change${totalChanges > 1 ? "s" : ""} applied.` });
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Ops Assistant</p>
            <p className="text-[10px] text-muted-foreground">Update tasks, roadmap & workflow with natural language</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="h-[300px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">Tell me what changed and I'll update your project.</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-[10px] px-2 py-1 rounded-full border border-border/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] space-y-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-lg px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground"
              }`}>
                {msg.content}
              </div>
              {msg.updates && (
                <div className="flex gap-1 flex-wrap">
                  {msg.updates.tasks ? <Badge variant="outline" className="text-[9px] h-4">{msg.updates.tasks} task{msg.updates.tasks > 1 ? "s" : ""}</Badge> : null}
                  {msg.updates.milestones ? <Badge variant="outline" className="text-[9px] h-4">{msg.updates.milestones} milestone{msg.updates.milestones > 1 ? "s" : ""}</Badge> : null}
                  {msg.updates.workflow ? <Badge variant="outline" className="text-[9px] h-4">{msg.updates.workflow} workflow step{msg.updates.workflow > 1 ? "s" : ""}</Badge> : null}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. 'Push launch to next Monday' or 'Add a testing phase'"
            className="text-xs h-8"
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <Button size="sm" className="h-8 px-3" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
