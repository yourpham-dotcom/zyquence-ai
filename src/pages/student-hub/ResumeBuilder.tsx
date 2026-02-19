import { useState } from "react";
import { FileText, Loader2, Sparkles, Copy, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Experience { title: string; company: string; duration: string; description: string; }

export default function ResumeBuilder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([{ title: "", company: "", duration: "", description: "" }]);
  const [targetRole, setTargetRole] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("resume");
  const [copied, setCopied] = useState(false);

  const addExperience = () => setExperiences([...experiences, { title: "", company: "", duration: "", description: "" }]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, j) => j !== i));
  const updateExperience = (i: number, field: keyof Experience, value: string) => {
    const next = [...experiences];
    next[i] = { ...next[i], [field]: value };
    setExperiences(next);
  };

  const generate = async (type: "resume" | "cover_letter") => {
    if (!name.trim()) { toast({ title: "Enter your name", variant: "destructive" }); return; }
    setLoading(true);

    const payload = `Name: ${name}\nEmail: ${email}\nSummary: ${summary}\nSkills: ${skills}\nEducation: ${education}\nTarget Role: ${targetRole}\nExperiences:\n${experiences.map((e) => `- ${e.title} at ${e.company} (${e.duration}): ${e.description}`).join("\n")}`;

    try {
      const resp = await supabase.functions.invoke("student-ai", {
        body: { mode: type, text: payload },
      });
      if (resp.error) throw resp.error;
      if (type === "resume") setGeneratedResume(resp.data?.result || "");
      else setCoverLetter(resp.data?.result || "");
      setTab(type === "resume" ? "preview" : "cover");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText className="h-6 w-6 text-amber-500" />Resume Builder</h1>
        <p className="text-muted-foreground text-sm">AI-powered resume and cover letter generation</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="resume">Edit Info</TabsTrigger>
          <TabsTrigger value="preview">Resume Preview</TabsTrigger>
          <TabsTrigger value="cover">Cover Letter</TabsTrigger>
        </TabsList>

        <TabsContent value="resume">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" /></div>
                <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" /></div>
              </div>
              <div><Label>Target Role</Label><Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Software Engineer Intern" /></div>
              <div><Label>Professional Summary</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary of your background..." rows={2} /></div>
              <div><Label>Skills</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, React, Data Analysis..." /></div>
              <div><Label>Education</Label><Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="BS Computer Science, XYZ University, 2025" /></div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Experience</Label>
                  <Button variant="ghost" size="sm" onClick={addExperience}><Plus className="h-3 w-3 mr-1" />Add</Button>
                </div>
                {experiences.map((exp, i) => (
                  <Card key={i} className="mb-2 bg-muted/30 border-border">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} className="flex-1" />
                        <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="flex-1" />
                        <Input placeholder="Duration" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} className="w-32" />
                        {experiences.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeExperience(i)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                      <Textarea placeholder="Description of responsibilities..." value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2} />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => generate("resume")} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Generate Resume
                </Button>
                <Button onClick={() => generate("cover_letter")} disabled={loading} variant="outline" className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Generate Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Generated Resume</CardTitle>
              {generatedResume && <Button variant="ghost" size="sm" onClick={() => copyText(generatedResume)}>{copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}{copied ? "Copied" : "Copy"}</Button>}
            </CardHeader>
            <CardContent>
              {generatedResume ? (
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{generatedResume}</div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">Fill in your info and click "Generate Resume" to get started.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Cover Letter</CardTitle>
              {coverLetter && <Button variant="ghost" size="sm" onClick={() => copyText(coverLetter)}>{copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}{copied ? "Copied" : "Copy"}</Button>}
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{coverLetter}</div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">Fill in your info and click "Generate Cover Letter" to get started.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">⚠️ AI-generated content. Always review and personalize before submitting.</p>
    </div>
  );
}
