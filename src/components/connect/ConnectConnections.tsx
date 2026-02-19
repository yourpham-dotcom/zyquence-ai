import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityProfile } from "@/hooks/useCommunityProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { UserPlus, Check, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ConnectConnections = () => {
  const { user } = useAuth();
  const { ensureProfile } = useCommunityProfile();
  const [connections, setConnections] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!user) return;
    await ensureProfile();

    // Accepted connections
    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // Pending incoming
    const { data: pend } = await supabase
      .from("connections")
      .select("*")
      .eq("status", "pending")
      .eq("receiver_id", user.id);

    const connUserIds = (conns || []).map((c: any) => c.requester_id === user.id ? c.receiver_id : c.requester_id);
    const pendUserIds = (pend || []).map((c: any) => c.requester_id);
    const allIds = [...new Set([...connUserIds, ...pendUserIds])];

    let profileMap = new Map();
    if (allIds.length) {
      const { data: profiles } = await supabase.from("community_profiles").select("*").in("user_id", allIds);
      profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    }

    setConnections((conns || []).map((c: any) => {
      const otherId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
      return { ...c, profile: profileMap.get(otherId) };
    }));

    setPending((pend || []).map((c: any) => ({ ...c, profile: profileMap.get(c.requester_id) })));

    // Suggestions: all profiles not yet connected
    const excludeIds = [...allIds, user.id];
    const { data: allProfiles } = await supabase
      .from("community_profiles")
      .select("*")
      .not("user_id", "in", `(${excludeIds.join(",")})`)
      .limit(20);
    setSuggestions(allProfiles || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    await supabase.from("connections").insert({ requester_id: user.id, receiver_id: receiverId });
    toast({ title: "Request sent!" });
    fetchData();
  };

  const respondRequest = async (connId: string, accept: boolean) => {
    await supabase.from("connections").update({ status: accept ? "accepted" : "declined" }).eq("id", connId);
    toast({ title: accept ? "Connection accepted!" : "Request declined" });
    fetchData();
  };

  const filtered = connections.filter((c: any) =>
    !search || c.profile?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Connections</h2>
        <p className="text-sm text-muted-foreground">Manage your network</p>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Pending Requests ({pending.length})</h3>
          {pending.map((req: any) => (
            <Card key={req.id} className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">{req.profile?.display_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{req.profile?.display_name || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{req.profile?.bio || "No bio"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="default" className="h-8" onClick={() => respondRequest(req.id, true)}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => respondRequest(req.id, false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* My Connections */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">My Connections ({connections.length})</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-8 text-xs"
            />
          </div>
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No connections yet</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c: any) => (
            <Card key={c.id} className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-accent text-foreground text-xs">{c.profile?.display_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.profile?.display_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c.profile?.currently_working_on || c.profile?.bio || "—"}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Suggested Connections</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((s: any) => (
              <Card key={s.id} className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.display_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.display_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.interests?.slice(0, 3).join(", ") || "No interests listed"}</p>
                </div>
                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => sendRequest(s.user_id)}>
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectConnections;
