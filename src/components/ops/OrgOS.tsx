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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Loader2, Crown, Shield, Users, UserCheck, Briefcase,
  ChevronLeft, Building2, Trash2, Pencil, Save, X, Network, ScanLine,
  UserCircle, Target, Dumbbell, Star
} from "lucide-react";
import OrgScanDrop from "./OrgScanDrop";

type TeamMember = {
  id: string;
  name: string;
  title: string;
  department: string;
  tier_level: string;
  entity_type: string;
  manager_id: string | null;
  avatar_url: string | null;
  responsibilities: string | null;
  goals: string | null;
  notes: string | null;
  created_at: string;
};

type ClientAssignment = {
  id: string;
  client_id: string;
  staff_id: string;
  role: string;
  responsibilities: string | null;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

const STAFF_ENTITY_TYPES = ["employee", "leadership", "contractor"];
const CLIENT_ENTITY_TYPES = ["client", "athlete", "customer"];

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; badgeClass: string }> = {
  c_suite: { label: "C-Suite", icon: Crown, color: "text-amber-400", badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  leadership: { label: "Leadership", icon: Shield, color: "text-blue-400", badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  manager: { label: "Managers", icon: UserCheck, color: "text-emerald-400", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  employee: { label: "Employees", icon: Users, color: "text-muted-foreground", badgeClass: "bg-secondary text-secondary-foreground border-border" },
  contractor: { label: "Contractors", icon: Briefcase, color: "text-purple-400", badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const ENTITY_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  client: { label: "Client", icon: UserCircle, badgeClass: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  athlete: { label: "Athlete", icon: Dumbbell, badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  customer: { label: "Customer", icon: Star, badgeClass: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
};

const TIER_ORDER = ["c_suite", "leadership", "manager", "employee", "contractor"];

export default function OrgOS({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "", department: "", tier_level: "", entity_type: "" });
  const [scanOpen, setScanOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"company" | "performance">("company");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) { fetchMembers(); fetchAssignments(); } }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const getRestHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${session?.access_token}`,
    };
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const headers = await getRestHeaders();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/team_members?select=*&user_id=eq.${user!.id}&order=created_at.asc`,
        { headers }
      );
      if (res.ok) setMembers(await res.json());
    } catch (e) { console.error("Fetch members error:", e); }
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      const headers = await getRestHeaders();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/client_assignments?select=*&user_id=eq.${user!.id}`,
        { headers }
      );
      if (res.ok) setAssignments(await res.json());
    } catch (e) { console.error("Fetch assignments error:", e); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || sending) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("orgos-chat", {
        body: {
          message: msg,
          teamMembers: members.map(m => ({ id: m.id, name: m.name, title: m.title, department: m.department, tier_level: m.tier_level, entity_type: m.entity_type })),
          assignments: assignments.map(a => ({ ...a, client_name: members.find(m => m.id === a.client_id)?.name, staff_name: members.find(m => m.id === a.staff_id)?.name })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply || "Done." }]);

      if (["add", "update", "delete", "bulk_add", "assign", "unassign"].includes(data.action)) {
        await fetchMembers();
        await fetchAssignments();
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const deleteMember = async (id: string) => {
    const headers = await getRestHeaders();
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/team_members?id=eq.${id}`, { method: "DELETE", headers });
    setMembers(prev => prev.filter(m => m.id !== id));
    toast({ title: "Member removed" });
  };

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, title: m.title, department: m.department, tier_level: m.tier_level, entity_type: m.entity_type });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const headers = await getRestHeaders();
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/team_members?id=eq.${editingId}`, {
      method: "PATCH", headers,
      body: JSON.stringify(editForm),
    });
    setMembers(prev => prev.map(m => m.id === editingId ? { ...m, ...editForm } : m));
    setEditingId(null);
    toast({ title: "Member updated" });
  };

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return null;
    return members.find(m => m.id === managerId)?.name || null;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const staffMembers = members.filter(m => STAFF_ENTITY_TYPES.includes(m.entity_type));
  const clientMembers = members.filter(m => CLIENT_ENTITY_TYPES.includes(m.entity_type));

  const groupedByTier = TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = staffMembers.filter(m => m.tier_level === tier);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const getClientAssignments = (clientId: string) => {
    return assignments
      .filter(a => a.client_id === clientId)
      .map(a => ({ ...a, staff: members.find(m => m.id === a.staff_id) }))
      .filter(a => a.staff);
  };

  const renderMemberCard = (m: TeamMember, showEntityBadge = false) => {
    const isClient = CLIENT_ENTITY_TYPES.includes(m.entity_type);
    const entityCfg = isClient ? ENTITY_CONFIG[m.entity_type] : null;
    const tierCfg = !isClient ? TIER_CONFIG[m.tier_level] || TIER_CONFIG.employee : null;

    return (
      <Card key={m.id} className={`border-border/50 ${
        isClient ? "border-sky-500/20 bg-sky-500/5" :
        m.tier_level === "c_suite" ? "border-amber-500/20 bg-amber-500/5" : ""
      }`}>
        <CardContent className="p-3">
          {editingId === m.id ? (
            <div className="space-y-2">
              <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" className="h-8 text-xs" />
              <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="h-8 text-xs" />
              <Input value={editForm.department} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" className="h-8 text-xs" />
              <div className="grid grid-cols-2 gap-2">
                <select value={editForm.tier_level} onChange={e => setEditForm(p => ({ ...p, tier_level: e.target.value }))} className="w-full h-8 text-xs rounded-md border border-input bg-background px-2">
                  {TIER_ORDER.map(t => <option key={t} value={t}>{TIER_CONFIG[t].label}</option>)}
                </select>
                <select value={editForm.entity_type} onChange={e => setEditForm(p => ({ ...p, entity_type: e.target.value }))} className="w-full h-8 text-xs rounded-md border border-input bg-background px-2">
                  <option value="employee">Employee</option>
                  <option value="leadership">Leadership</option>
                  <option value="contractor">Contractor</option>
                  <option value="client">Client</option>
                  <option value="athlete">Athlete</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="h-7 text-xs" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`text-xs ${
                  isClient ? "bg-sky-500/20 text-sky-400" :
                  m.tier_level === "c_suite" ? "bg-amber-500/20 text-amber-400" : "bg-muted"
                }`}>
                  {getInitials(m.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  {entityCfg && (
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${entityCfg.badgeClass}`}>{entityCfg.label}</Badge>
                  )}
                  {tierCfg && !isClient && (
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${tierCfg.badgeClass}`}>{tierCfg.label.split(" ")[0]}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{m.title}</p>
                <p className="text-[10px] text-muted-foreground">{m.department}</p>
                {getManagerName(m.manager_id) && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">Reports to: {getManagerName(m.manager_id)}</p>
                )}
                {m.goals && <p className="text-[10px] text-primary/70 mt-0.5">Goal: {m.goals}</p>}
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(m)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMember(m.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCompanyView = () => (
    <div className="space-y-6">
      {/* Staff by Tier */}
      {TIER_ORDER.map(tier => {
        const tierMembers = groupedByTier[tier];
        if (!tierMembers?.length) return null;
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
              {tierMembers.map(m => renderMemberCard(m))}
            </div>
          </div>
        );
      })}

      {/* Clients / Athletes Section */}
      {clientMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-semibold">Clients & Athletes</span>
            <Badge variant="secondary" className="text-[10px]">{clientMembers.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {clientMembers.map(m => renderMemberCard(m, true))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Building2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No team members yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Use the chat to add people — try "John is CEO" or "Add athlete Player A"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPerformanceView = () => (
    <div className="space-y-4">
      {clientMembers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No clients or athletes yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Try "Add athlete Player A" or "Add client John Smith"</p>
          </CardContent>
        </Card>
      ) : (
        clientMembers.map(client => {
          const clientAssigns = getClientAssignments(client.id);
          const entityCfg = ENTITY_CONFIG[client.entity_type] || ENTITY_CONFIG.client;
          const EntityIcon = entityCfg.icon;
          return (
            <Card key={client.id} className="border-sky-500/20 bg-sky-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-sky-500/20 text-sky-400 text-sm">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{client.name}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${entityCfg.badgeClass}`}>
                        <EntityIcon className="h-3 w-3 mr-0.5" />{entityCfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{client.title}</p>
                    {client.goals && <p className="text-[10px] text-primary/70">Goal: {client.goals}</p>}
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(client)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMember(client.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>

                {clientAssigns.length > 0 ? (
                  <div className="ml-6 border-l-2 border-sky-500/20 pl-4 space-y-2">
                    {clientAssigns.map(a => (
                      <div key={a.id} className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-muted text-[10px]">{getInitials(a.staff!.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{a.staff!.name}</p>
                          <p className="text-[10px] text-muted-foreground">{a.role}</p>
                        </div>
                        {a.responsibilities && (
                          <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{a.responsibilities}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ml-6 text-[10px] text-muted-foreground italic">No staff assigned. Try "Assign John as coach for {client.name}"</p>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderOrgChart = () => {
    if (viewMode === "performance") {
      return renderPerformanceView();
    }
    const tiers = TIER_ORDER.filter(t => groupedByTier[t]?.length > 0);
    return (
      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const cfg = TIER_CONFIG[tier];
          const Icon = cfg.icon;
          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${cfg.color}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cfg.label}</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {groupedByTier[tier].map(m => (
                  <div key={m.id} className={`px-3 py-2 rounded-lg border text-center min-w-[120px] ${tier === "c_suite" ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.title}</p>
                  </div>
                ))}
              </div>
              {i < tiers.length - 1 && (
                <div className="flex justify-center my-2"><div className="w-px h-6 bg-border" /></div>
              )}
            </div>
          );
        })}
        {/* Show client connections in org chart */}
        {clientMembers.length > 0 && (
          <>
            <div className="flex justify-center my-2"><div className="w-px h-6 bg-sky-500/30" /></div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clients & Athletes</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {clientMembers.map(m => (
                <div key={m.id} className="px-3 py-2 rounded-lg border border-sky-500/30 bg-sky-500/5 text-center min-w-[120px]">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.title}</p>
                  <Badge variant="outline" className={`text-[8px] mt-1 ${ENTITY_CONFIG[m.entity_type]?.badgeClass || ""}`}>
                    {ENTITY_CONFIG[m.entity_type]?.label || m.entity_type}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
        {tiers.length === 0 && clientMembers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No team members yet. Use the chat to add people.</p>
        )}
      </div>
    );
  };

  const chatExamples = viewMode === "performance"
    ? ["Add athlete Player A as NBA Prospect", "Assign John as shooting coach for Player A", "Create performance team for Player A", "Add client John Smith"]
    : ["John is CEO", "Sarah becomes Marketing Director", "Create leadership team for 5 people", "Promote Anna to CFO"];

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
          <p className="text-xs text-muted-foreground">Organization Operating System — manage teams, clients & athletes</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{staffMembers.length} staff</Badge>
          {clientMembers.length > 0 && <Badge variant="outline" className="text-xs border-sky-500/30 text-sky-400">{clientMembers.length} clients</Badge>}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setScanOpen(true)}>
            <ScanLine className="h-4 w-4" /> Scan Org
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "company" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setViewMode("company")}
        >
          <Building2 className="h-3.5 w-3.5" /> Company Structure
        </Button>
        <Button
          variant={viewMode === "performance" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setViewMode("performance")}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Performance Team
        </Button>
      </div>

      <OrgScanDrop open={scanOpen} onOpenChange={setScanOpen} onMembersAdded={() => { fetchMembers(); fetchAssignments(); }} />

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="team" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Team</TabsTrigger>
          <TabsTrigger value="chart" className="gap-1.5"><Network className="h-3.5 w-3.5" /> Org Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ScrollArea className="max-h-[75vh]">
                {viewMode === "company" ? renderCompanyView() : renderPerformanceView()}
              </ScrollArea>
            </div>

            {/* Chat panel */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 h-[600px] flex flex-col">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> OrgOS Assistant
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Manage staff, clients & assignments with natural language</p>
                </CardHeader>
                <Separator />
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-xs text-muted-foreground">Try commands like:</p>
                      {chatExamples.map(ex => (
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
                    placeholder={viewMode === "performance" ? "e.g. Assign coach for Player A..." : "e.g. John is CEO..."}
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

        <TabsContent value="chart">
          <Card className="border-border/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">
                {viewMode === "company" ? "Organization Hierarchy" : "Performance Team Hierarchy"}
              </CardTitle>
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
