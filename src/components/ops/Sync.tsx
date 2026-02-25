import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, MessageSquare, Plus, Send, Users, Hash, User,
  Loader2, ListTodo, Trash2, CheckCircle2, Clock
} from "lucide-react";
import { format } from "date-fns";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type SyncChat = {
  id: string;
  user_id: string;
  title: string;
  chat_type: string;
  project_id: string | null;
  created_at: string;
};

type SyncMessage = {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
};

type TaskSuggestion = {
  detected: boolean;
  task?: {
    title: string;
    description: string;
    assigned_to: string | null;
    priority: string;
    deadline_hint: string | null;
  };
  messageId?: string;
};

export default function Sync({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<SyncChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SyncChat | null>(null);
  const [messages, setMessages] = useState<SyncMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [newChatType, setNewChatType] = useState<"group" | "direct">("group");
  const [taskSuggestion, setTaskSuggestion] = useState<TaskSuggestion | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchChats(); }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat.id);

    const channel = supabase
      .channel(`sync-messages-${selectedChat.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sync_messages",
        filter: `chat_id=eq.${selectedChat.id}`,
      }, (payload) => {
        const newMsg = payload.new as SyncMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sync_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setChats(data as unknown as SyncChat[]);
    setLoading(false);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from("sync_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as unknown as SyncMessage[]);
  };

  const createChat = async () => {
    if (!newChatTitle.trim()) return;
    const { data, error } = await supabase.from("sync_chats").insert({
      user_id: user!.id,
      title: newChatTitle,
      chat_type: newChatType,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const chat = data as unknown as SyncChat;
    setChats(prev => [chat, ...prev]);
    setSelectedChat(chat);
    setNewChatTitle("");
    setShowNewChat(false);
    toast({ title: "Chat created" });
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from("sync_chats").delete().eq("id", chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (selectedChat?.id === chatId) { setSelectedChat(null); setMessages([]); }
    toast({ title: "Chat deleted" });
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    setSending(true);
    const content = messageInput;
    setMessageInput("");

    const { data, error } = await supabase.from("sync_messages").insert({
      chat_id: selectedChat.id,
      user_id: user!.id,
      content,
      message_type: "text",
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSending(false);
      return;
    }

    // Detect tasks in message (fire and forget, non-blocking)
    detectTask(content, (data as any).id);
    setSending(false);
  };

  const detectTask = async (message: string, messageId: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-detect-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          message,
          projectTitle: selectedChat?.title || "",
          projectGoal: "",
        }),
      });
      if (!res.ok) return;
      const result = await res.json();
      if (result.detected && result.task) {
        setTaskSuggestion({ ...result, messageId });
      }
    } catch {
      // Silent fail for task detection
    }
  };

  const createTaskFromSuggestion = async () => {
    if (!taskSuggestion?.task || !user) return;
    setCreatingTask(true);
    try {
      // Find or use project linked to chat
      const projectId = selectedChat?.project_id;

      if (projectId) {
        // Create ops task linked to project
        await supabase.from("ops_tasks").insert({
          project_id: projectId,
          user_id: user.id,
          title: taskSuggestion.task.title,
          description: taskSuggestion.task.description,
          assigned_to: taskSuggestion.task.assigned_to || null,
          priority: taskSuggestion.task.priority || "medium",
          status: "not_started",
          sort_order: 0,
        });
        toast({ title: "Task created!", description: `"${taskSuggestion.task.title}" added to project.` });
      } else {
        // Send system message about the task
        await supabase.from("sync_messages").insert({
          chat_id: selectedChat!.id,
          user_id: user.id,
          content: `📋 Task Created: ${taskSuggestion.task.title}\n${taskSuggestion.task.assigned_to ? `Assigned: ${taskSuggestion.task.assigned_to}` : ""}\nPriority: ${taskSuggestion.task.priority}${taskSuggestion.task.deadline_hint ? `\nDeadline: ${taskSuggestion.task.deadline_hint}` : ""}`,
          message_type: "system",
        });
        toast({ title: "Task noted!", description: "Link this chat to a project for full task tracking." });
      }
      setTaskSuggestion(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupChats = chats.filter(c => c.chat_type === "group");
  const directChats = chats.filter(c => c.chat_type === "direct");
  const projectChats = chats.filter(c => c.project_id);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sync</h1>
          <p className="text-xs text-muted-foreground">Team collaboration & execution hub</p>
        </div>
      </div>

      <div className="flex gap-0 border rounded-lg overflow-hidden h-[calc(100%-3.5rem)] bg-card">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-64" : "w-0"} border-r flex-shrink-0 flex flex-col transition-all overflow-hidden`}>
          <div className="p-3 border-b">
            <Button size="sm" className="w-full gap-1.5" onClick={() => setShowNewChat(true)}>
              <Plus className="h-3.5 w-3.5" /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-3">
              {/* Team Spaces / Group */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Team Spaces</p>
                {groupChats.length === 0 && <p className="text-xs text-muted-foreground/50 px-2">No groups yet</p>}
                {groupChats.map(c => (
                  <button key={c.id} onClick={() => setSelectedChat(c)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedChat?.id === c.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>

              {/* Project Chats */}
              {projectChats.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Project Chats</p>
                  {projectChats.map(c => (
                    <button key={c.id} onClick={() => setSelectedChat(c)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedChat?.id === c.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                      <ListTodo className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Messages */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Direct Messages</p>
                {directChats.length === 0 && <p className="text-xs text-muted-foreground/50 px-2">No DMs yet</p>}
                {directChats.map(c => (
                  <button key={c.id} onClick={() => setSelectedChat(c)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedChat?.id === c.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <>
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <h2 className="font-medium text-sm truncate">{selectedChat.title}</h2>
                  <Badge variant="outline" className="text-[10px] shrink-0">{selectedChat.chat_type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Users className="h-3 w-3" /> Participants
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteChat(selectedChat.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.message_type === "system" ? "justify-center" : ""}`}>
                      {msg.message_type === "system" ? (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 max-w-md">
                          <p className="text-xs text-primary whitespace-pre-line">{msg.content}</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">You</span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(msg.created_at), "h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Task Suggestion Banner */}
              {taskSuggestion && (
                <div className="mx-4 mb-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                  <ListTodo className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-200">Create Task from Message?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">"{taskSuggestion.task?.title}"</p>
                    {taskSuggestion.task?.assigned_to && <p className="text-[10px] text-muted-foreground">Assigned: {taskSuggestion.task.assigned_to}</p>}
                    {taskSuggestion.task?.deadline_hint && <p className="text-[10px] text-muted-foreground">Deadline: {taskSuggestion.task.deadline_hint}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-7 text-xs" onClick={createTaskFromSuggestion} disabled={creatingTask}>
                      {creatingTask ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3 w-3 mr-1" /> Accept</>}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setTaskSuggestion(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${selectedChat.title}...`}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button size="icon" onClick={sendMessage} disabled={sending || !messageInput.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <h3 className="text-sm font-medium text-muted-foreground">Select a chat or create a new one</h3>
                <p className="text-xs text-muted-foreground/60 mt-1">Communication turns into execution</p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowNewChat(true)}>
                  <Plus className="h-3.5 w-3.5" /> New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription>Create a team space or direct message.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Chat Name</label>
              <Input value={newChatTitle} onChange={e => setNewChatTitle(e.target.value)} placeholder="e.g. Marketing Team" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant={newChatType === "group" ? "default" : "outline"} onClick={() => setNewChatType("group")} className="flex-1 gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Group
                </Button>
                <Button size="sm" variant={newChatType === "direct" ? "default" : "outline"} onClick={() => setNewChatType("direct")} className="flex-1 gap-1.5">
                  <User className="h-3.5 w-3.5" /> Direct
                </Button>
              </div>
            </div>
            <Button onClick={createChat} disabled={!newChatTitle.trim()} className="w-full">
              Create Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
