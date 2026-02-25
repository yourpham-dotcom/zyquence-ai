import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Send, Loader2, Crown, Shield, Users, UserCheck, Briefcase,
  ChevronLeft, Building2, Trash2, Pencil, Save, X, Network, ScanLine
} from "lucide-react";
import OrgScanDrop from "./OrgScanDrop";

type TeamMember = {
  id: string;
  name: string;
  title: string;
  department: string;
  tier_level: string;
  manager_id: string | null;
  avatar_url: string | null;
  responsibilities: string | null;
  created_at: string;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; badgeClass: string }> = {
  c_suite: { label: "C-Suite", icon: Crown, color: "text-amber-400", badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  leadership: { label: "Leadership / Directors", icon: Shield, color: "text-blue-400", badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  manager: { label: "Managers", icon: UserCheck, color: "text-emerald-400", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  employee: { label: "Employees", icon: Users, color: "text-muted-foreground", badgeClass: "bg-secondary text-secondary-foreground border-border" },
  contractor: { label: "Contractors / Others", icon: Briefcase, color: "text-purple-400", badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const TIER_ORDER = ["c_suite", "leadership", "manager", "employee", "contractor"];

export default function OrgOS({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "", department: "", tier_level: "" });
  const [scanOpen, setScanOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchMembers(); }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("team_members").select("*").order("created_at");
    if (data) setMembers(data as unknown as TeamMember[]);
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || sending) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("orgos-chat", {
        body: { message: msg, teamMembers: members.map(m => ({ id: m.id, name: m.name, title: m.title, department: m.department, tier_level: m.tier_level })) },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const reply = data.reply || "Done.";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);

      if (["add", "update", "delete", "bulk_add"].includes(data.action)) {
        await fetchMembers();
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const deleteMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    setMembers(prev => prev.filter(m => m.id !== id));
    toast({ title: "Member removed" });
  };

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, title: m.title, department: m.department, tier_level: m.tier_level });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("team_members").update({
      name: editForm.name,
      title: editForm.title,
      department: editForm.department,
      tier_level: editForm.tier_level,
    }).eq("id", editingId);
    setMembers(prev => prev.map(m => m.id === editingId ? { ...m, ...editForm } : m));
    setEditingId(null);
    toast({ title: "Member updated" });
  };

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return null;
    const mgr = members.find(m => m.id === managerId);
    return mgr ? mgr.name : null;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const groupedByTier = TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = members.filter(m => m.tier_level === tier);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Org chart data
  const renderOrgChart = () => {
    const tiers = TIER_ORDER.filter(t => groupedByTier[t]?.length > 0);
    return (
      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const cfg = TIER_CONFIG[tier];
          const Icon = cfg.icon;
          const tierMembers = groupedByTier[tier];
          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cfg.label}</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {tierMembers.map(m => (
                  <div key={m.id} className={`px-3 py-2 rounded-lg border text-center min-w-[120px] ${tier === "c_suite" ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.title}</p>
                  </div>
                ))}
              </div>
              {i < tiers.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-px h-6 bg-border" />
                </div>
              )}
            </div>
          );
        })}
        {tiers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No team members yet. Use the chat to add people.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> OrgOS
          </h1>
          <p className="text-xs text-muted-foreground">Organization Operating System — manage your team with natural language</p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">{members.length} members</Badge>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setScanOpen(true)}>
          <ScanLine className="h-4 w-4" /> Scan Org
        </Button>
      </div>

      <OrgScanDrop open={scanOpen} onOpenChange={setScanOpen} onMembersAdded={fetchMembers} />

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="team" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Team</TabsTrigger>
          <TabsTrigger value="chart" className="gap-1.5"><Network className="h-3.5 w-3.5" /> Org Chart</TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Team sections */}
            <div className="lg:col-span-2 space-y-4">
              {TIER_ORDER.map(tier => {
                const tierMembers = groupedByTier[tier];
                if (tierMembers.length === 0) return null;
                const cfg = TIER_CONFIG[tier];
                const Icon = cfg.icon;
                return (
                  <div key={tier}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                      <span className="text-sm font-semibold">{cfg.label}</span>
                      <Badge variant="secondary" className="text-[10px]">{tierMembers.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tierMembers.map(m => (
                        <Card key={m.id} className={`border-border/50 ${tier === "c_suite" ? "border-amber-500/20 bg-amber-500/5" : ""}`}>
                          <CardContent className="p-3">
                            {editingId === m.id ? (
                              <div className="space-y-2">
                                <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" className="h-8 text-xs" />
                                <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="h-8 text-xs" />
                                <Input value={editForm.department} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" className="h-8 text-xs" />
                                <select value={editForm.tier_level} onChange={e => setEditForm(p => ({ ...p, tier_level: e.target.value }))} className="w-full h-8 text-xs rounded-md border border-input bg-background px-2">
                                  {TIER_ORDER.map(t => <option key={t} value={t}>{TIER_CONFIG[t].label}</option>)}
                                </select>
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-7 text-xs" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className={`text-xs ${tier === "c_suite" ? "bg-amber-500/20 text-amber-400" : "bg-muted"}`}>
                                    {getInitials(m.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium truncate">{m.name}</span>
                                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${cfg.badgeClass}`}>{cfg.label.split(" ")[0]}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{m.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{m.department}</p>
                                  {getManagerName(m.manager_id) && (
                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Reports to: {getManagerName(m.manager_id)}</p>
                                  )}
                                </div>
                                <div className="flex gap-0.5">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(m)}><Pencil className="h-3 w-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMember(m.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
              {members.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No team members yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Use the chat to add people — try "John is CEO"</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chat panel */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 h-[600px] flex flex-col">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> OrgOS Assistant
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Assign roles or update organization using natural language</p>
                </CardHeader>
                <Separator />
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-xs text-muted-foreground">Try commands like:</p>
                      {["John is CEO", "Sarah becomes Marketing Director", "Create leadership team for 5 people", "Promote Anna to CFO"].map(ex => (
                        <button key={ex} onClick={() => setChatInput(ex)} className="block mx-auto text-xs text-primary/80 hover:text-primary transition-colors">
                          "{ex}"
                        </button>
                      ))}
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2"><Loader2 className="h-3 w-3 animate-spin" /></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <Separator />
                <div className="p-2 flex gap-1.5">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                    placeholder="e.g. John is CEO..."
                    className="h-8 text-xs"
                    disabled={sending}
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendChat} disabled={sending || !chatInput.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Org Chart Tab */}
        <TabsContent value="chart">
          <Card className="border-border/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Organization Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {renderOrgChart()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
