import { useState, useEffect } from "react";
import { useCommunityProfile } from "@/hooks/useCommunityProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ConnectProfile = () => {
  const { profile, loading, ensureProfile, updateProfile } = useCommunityProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    goals: "",
    location: "",
    currently_working_on: "",
    interests: [] as string[],
    skills: [] as string[],
  });
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    ensureProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        goals: profile.goals || "",
        location: profile.location || "",
        currently_working_on: profile.currently_working_on || "",
        interests: profile.interests || [],
        skills: profile.skills || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
    toast({ title: "Profile updated!" });
  };

  const addInterest = () => {
    if (newInterest.trim() && !form.interests.includes(newInterest.trim())) {
      setForm((f) => ({ ...f, interests: [...f.interests, newInterest.trim()] }));
      setNewInterest("");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((f) => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground">How others see you on Zyquence Connect</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline">Edit Profile</Button>
        ) : (
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-1.5" /> Save</Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {form.display_name.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editing ? (
                <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Display name" />
              ) : (
                <h3 className="text-xl font-bold text-foreground">{form.display_name}</h3>
              )}
              {form.location && !editing && <p className="text-sm text-muted-foreground">📍 {form.location}</p>}
              {editing && <Input className="mt-2" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location" />}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
              {editing ? (
                <Textarea className="mt-1" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." />
              ) : (
                <p className="text-sm text-foreground/80 mt-1">{form.bio || "No bio yet"}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currently Working On</label>
              {editing ? (
                <Input className="mt-1" value={form.currently_working_on} onChange={(e) => setForm((f) => ({ ...f, currently_working_on: e.target.value }))} placeholder="What are you building?" />
              ) : (
                <p className="text-sm text-foreground/80 mt-1">{form.currently_working_on || "Nothing listed"}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goals</label>
              {editing ? (
                <Textarea className="mt-1" value={form.goals} onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))} placeholder="What are you working toward?" />
              ) : (
                <p className="text-sm text-foreground/80 mt-1">{form.goals || "No goals listed"}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interests</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.interests.map((i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {i}
                    {editing && <button onClick={() => setForm((f) => ({ ...f, interests: f.interests.filter((x) => x !== i) }))} className="ml-1"><X className="h-3 w-3" /></button>}
                  </Badge>
                ))}
                {editing && (
                  <div className="flex gap-1">
                    <Input className="h-6 w-24 text-xs" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addInterest()} placeholder="Add..." />
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={addInterest}><Plus className="h-3 w-3" /></Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {s}
                    {editing && <button onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))} className="ml-1"><X className="h-3 w-3" /></button>}
                  </Badge>
                ))}
                {editing && (
                  <div className="flex gap-1">
                    <Input className="h-6 w-24 text-xs" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="Add..." />
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={addSkill}><Plus className="h-3 w-3" /></Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectProfile;
