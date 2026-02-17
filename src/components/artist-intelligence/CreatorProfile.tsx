import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BACKGROUNDS = ["Athlete", "Student", "Creator", "Entrepreneur", "Professional", "Artist", "Musician"];
const PERSONALITY_TRAITS = ["Ambitious", "Creative", "Introverted", "Bold", "Analytical", "Empathetic", "Competitive", "Visionary", "Resilient", "Authentic"];
const GENRES = ["Hip-Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz", "Soul", "Afrobeats", "Latin", "Country", "Alternative", "Indie"];
const EXPERIENCE_LEVELS = ["Beginner", "Hobby", "Serious"];

interface CreatorProfileProps {
  onComplete: (profileId: string) => void;
  existingProfile?: any;
}

const CreatorProfile = ({ onComplete, existingProfile }: CreatorProfileProps) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    stage_name: existingProfile?.stage_name || "",
    background: existingProfile?.background || "",
    personality_traits: existingProfile?.personality_traits || [],
    lifestyle: existingProfile?.lifestyle || "",
    inspirations: existingProfile?.inspirations?.join(", ") || "",
    music_goals: existingProfile?.music_goals || "",
    preferred_genres: existingProfile?.preferred_genres || [],
    voice_type: existingProfile?.voice_type || "",
    experience_level: existingProfile?.experience_level || "beginner",
  });

  const steps = [
    { title: "Identity", subtitle: "Who are you?" },
    { title: "Personality", subtitle: "Your traits & lifestyle" },
    { title: "Music", subtitle: "Your sound direction" },
    { title: "Goals", subtitle: "Your creative vision" },
  ];

  const toggleTrait = (trait: string) => {
    setForm(f => ({
      ...f,
      personality_traits: f.personality_traits.includes(trait)
        ? f.personality_traits.filter((t: string) => t !== trait)
        : [...f.personality_traits, trait],
    }));
  };

  const toggleGenre = (genre: string) => {
    setForm(f => ({
      ...f,
      preferred_genres: f.preferred_genres.includes(genre)
        ? f.preferred_genres.filter((g: string) => g !== genre)
        : [...f.preferred_genres, genre],
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        user_id: user.id,
        stage_name: form.stage_name || null,
        background: form.background,
        personality_traits: form.personality_traits,
        lifestyle: form.lifestyle,
        inspirations: form.inspirations.split(",").map((s: string) => s.trim()).filter(Boolean),
        music_goals: form.music_goals,
        preferred_genres: form.preferred_genres,
        voice_type: form.voice_type || null,
        experience_level: form.experience_level.toLowerCase(),
      };

      if (existingProfile?.id) {
        const { error } = await supabase.from("artist_profiles").update(profileData).eq("id", existingProfile.id);
        if (error) throw error;
        toast.success("Profile updated");
        onComplete(existingProfile.id);
      } else {
        const { data, error } = await supabase.from("artist_profiles").insert(profileData).select("id").single();
        if (error) throw error;
        toast.success("Profile created");
        onComplete(data.id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Creator Profile Setup</h1>
        <p className="text-sm text-muted-foreground">Build your artist intelligence foundation</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className="text-[10px] mt-1 text-muted-foreground">{s.title}</p>
          </div>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{steps[step].title}</CardTitle>
          <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Stage Name (optional)</label>
                <Input value={form.stage_name} onChange={e => setForm(f => ({ ...f, stage_name: e.target.value }))} placeholder="Your artist name" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Background</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BACKGROUNDS.map(b => (
                    <Badge key={b} variant={form.background === b ? "default" : "outline"} className="cursor-pointer" onClick={() => setForm(f => ({ ...f, background: b }))}>
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Experience Level</label>
                <div className="flex gap-2 mt-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <Badge key={l} variant={form.experience_level.toLowerCase() === l.toLowerCase() ? "default" : "outline"} className="cursor-pointer" onClick={() => setForm(f => ({ ...f, experience_level: l }))}>
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Personality Traits</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PERSONALITY_TRAITS.map(t => (
                    <Badge key={t} variant={form.personality_traits.includes(t) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleTrait(t)}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Lifestyle Description</label>
                <Textarea value={form.lifestyle} onChange={e => setForm(f => ({ ...f, lifestyle: e.target.value }))} placeholder="Describe your daily life, environment, and energy..." className="mt-1" rows={3} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Preferred Genres</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GENRES.map(g => (
                    <Badge key={g} variant={form.preferred_genres.includes(g) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleGenre(g)}>
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Inspirations / Favorite Artists</label>
                <Input value={form.inspirations} onChange={e => setForm(f => ({ ...f, inspirations: e.target.value }))} placeholder="Drake, Kendrick, SZA..." className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Comma-separated</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Voice Type (optional)</label>
                <Input value={form.voice_type} onChange={e => setForm(f => ({ ...f, voice_type: e.target.value }))} placeholder="e.g. Deep, Raspy, Melodic..." className="mt-1" />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <label className="text-sm font-medium text-foreground">Music Goals</label>
              <Textarea value={form.music_goals} onChange={e => setForm(f => ({ ...f, music_goals: e.target.value }))} placeholder="What do you want to achieve with music? Where do you see yourself?" className="mt-1" rows={5} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
            {existingProfile ? "Update Profile" : "Create Profile"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreatorProfile;
