import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, LogIn, LogOut, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ConnectGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;
    const { data: allGroups } = await supabase.from("community_groups").select("*").order("created_at", { ascending: false });
    setGroups(allGroups || []);

    const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", user.id);
    setMyGroups(new Set((memberships || []).map((m: any) => m.group_id)));
  };

  useEffect(() => { fetchGroups(); }, [user]);

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const { data } = await supabase
      .from("community_groups")
      .insert({ name: newGroupName.trim(), description: newGroupDesc.trim(), created_by: user.id })
      .select()
      .single();
    if (data) {
      await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id, role: "admin" });
    }
    setNewGroupName("");
    setNewGroupDesc("");
    setCreateOpen(false);
    fetchGroups();
    toast({ title: "Group created!" });
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id });
    toast({ title: "Joined group!" });
    fetchGroups();
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
    toast({ title: "Left group" });
    if (selectedGroup?.id === groupId) setSelectedGroup(null);
    fetchGroups();
  };

  const openGroup = async (group: any) => {
    setSelectedGroup(group);
    const { data } = await supabase
      .from("group_posts")
      .select("*")
      .eq("group_id", group.id)
      .order("created_at", { ascending: true });

    if (!data) { setGroupPosts([]); return; }
    const userIds = [...new Set(data.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase.from("community_profiles").select("user_id, display_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setGroupPosts(data.map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) })));
  };

  const postInGroup = async () => {
    if (!newPostContent.trim() || !user || !selectedGroup) return;
    await supabase.from("group_posts").insert({ group_id: selectedGroup.id, user_id: user.id, content: newPostContent.trim() });
    setNewPostContent("");
    openGroup(selectedGroup);
  };

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Group List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Groups</h3>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8"><Plus className="h-3.5 w-3.5 mr-1" /> Create</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a Group</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                <Textarea placeholder="Description" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="min-h-[60px]" />
                <Button onClick={createGroup} disabled={!newGroupName.trim()} className="w-full">Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groups.map((g: any) => {
            const isMember = myGroups.has(g.id);
            return (
              <div
                key={g.id}
                className={`p-3 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer ${selectedGroup?.id === g.id ? "bg-accent" : ""}`}
                onClick={() => isMember && openGroup(g)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{g.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{g.description || "No description"}</p>
                  </div>
                  {isMember ? (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={(e) => { e.stopPropagation(); leaveGroup(g.id); }}>
                      <LogOut className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={(e) => { e.stopPropagation(); joinGroup(g.id); }}>
                      <LogIn className="h-3 w-3 mr-1" /> Join
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {groups.length === 0 && <p className="text-sm text-muted-foreground p-4">No groups yet. Create one!</p>}
        </div>
      </div>

      {/* Group Chat */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{selectedGroup.icon}</div>
                <div>
                  <p className="text-sm font-bold text-foreground">{selectedGroup.name}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedGroup.description}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {groupPosts.map((p: any) => (
                <div key={p.id} className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                    {p.profile?.display_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-foreground">{p.profile?.display_name || "User"}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(p.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">{p.content}</p>
                  </div>
                </div>
              ))}
              {groupPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>}
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                className="flex-1 bg-accent/50 rounded-xl px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Message this group..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postInGroup()}
              />
              <Button onClick={postInGroup} disabled={!newPostContent.trim()} size="icon" className="rounded-xl h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Select a group</p>
              <p className="text-sm">Join or create a group to start collaborating</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectGroups;
