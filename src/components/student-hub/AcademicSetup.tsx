import { useState } from "react";
import { GraduationCap, School, BookOpen, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props {
  onComplete: () => void;
}

export default function AcademicSetup({ onComplete }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    school_name: "",
    major: "",
    minor: "",
    start_semester: "fall",
    start_year: new Date().getFullYear(),
    expected_graduation_year: new Date().getFullYear() + 4,
    is_transfer: false,
    total_required_units: 120,
  });

  const handleSubmit = async () => {
    if (!user || !form.school_name.trim() || !form.major.trim()) {
      toast({ title: "Please fill in School and Major", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from("academic_profiles")
        .insert({
          user_id: user.id,
          school_name: form.school_name.trim(),
          major: form.major.trim(),
          minor: form.minor.trim() || null,
          start_semester: form.start_semester,
          start_year: form.start_year,
          expected_graduation_year: form.expected_graduation_year,
          is_transfer: form.is_transfer,
          total_required_units: form.total_required_units,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-generate semesters
      if (profile) {
        const semesters = [];
        let order = 0;
        for (let year = form.start_year; year <= (form.expected_graduation_year || form.start_year + 4); year++) {
          const startFall = year === form.start_year && form.start_semester === "spring" ? false : true;
          if (startFall || year > form.start_year) {
            semesters.push({
              user_id: user.id,
              profile_id: profile.id,
              semester_name: `Fall ${year}`,
              semester_year: year,
              semester_type: "fall" as const,
              sort_order: order++,
            });
          }
          if (year < (form.expected_graduation_year || form.start_year + 4) || form.start_semester === "spring") {
            semesters.push({
              user_id: user.id,
              profile_id: profile.id,
              semester_name: `Spring ${year + 1}`,
              semester_year: year + 1,
              semester_type: "spring" as const,
              sort_order: order++,
            });
          }
        }
        if (semesters.length > 0) {
          await supabase.from("academic_semesters").insert(semesters);
        }
      }

      toast({ title: "Academic Blueprint created!" });
      onComplete();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Academic Blueprint</h1>
        <p className="text-muted-foreground">Set up your academic profile to build your personalized roadmap</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-5">
          <div>
            <Label className="flex items-center gap-1.5"><School className="h-3.5 w-3.5" />School Name *</Label>
            <Input value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} placeholder="e.g. California State University" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Major *</Label>
              <Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="e.g. Computer Science" className="mt-1" />
            </div>
            <div>
              <Label>Minor (optional)</Label>
              <Input value={form.minor} onChange={(e) => setForm({ ...form, minor: e.target.value })} placeholder="e.g. Mathematics" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Start Semester</Label>
              <Select value={form.start_semester} onValueChange={(v) => setForm({ ...form, start_semester: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Year</Label>
              <Input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expected Graduation Year</Label>
              <Input type="number" value={form.expected_graduation_year} onChange={(e) => setForm({ ...form, expected_graduation_year: Number(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Total Required Units</Label>
              <Input type="number" value={form.total_required_units} onChange={(e) => setForm({ ...form, total_required_units: Number(e.target.value) })} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label>Transfer Student?</Label>
            <Switch checked={form.is_transfer} onCheckedChange={(v) => setForm({ ...form, is_transfer: v })} />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            Build My Blueprint
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
