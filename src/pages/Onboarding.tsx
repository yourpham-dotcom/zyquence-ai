import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type OnboardingAnswers } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, User, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ELITE_EMAILS = ["yourpham@gmail.com", "illestrj.12@gmail.com", "asantimokwala48@gmail.com"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProfile } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    account_type: "",
    industry: "",
    description: "",
    problems: "",
    workflows: "",
    desired_features: "",
    interests: "",
  });

  const set = (key: keyof OnboardingAnswers, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!answers.account_type || !answers.industry.trim()) {
      toast.error("Please select an account type and enter your industry.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await saveProfile(answers);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }
    toast.success("Welcome to Zyquence!");
    const destination = ELITE_EMAILS.includes(user?.email ?? "") ? "/elite" : "/dashboard";
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40">
        <span className="text-lg font-bold tracking-tight text-foreground">Zyquence</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-12 px-6">
        <div className="w-full max-w-xl mx-auto space-y-10">

          {/* Header */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Almost there
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tell us about yourself
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll use your answers to personalize your dashboard.
            </p>
          </div>

          {/* Account type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Are you using Zyquence as an individual or a company? <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "individual", label: "Individual", icon: User, desc: "Personal use, freelancer, or solo creator" },
                { value: "company", label: "Company", icon: Building2, desc: "Team, agency, or business" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("account_type", value)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all relative",
                    answers.account_type === value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    answers.account_type === value ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  {answers.account_type === value && (
                    <CheckCircle2 className="w-4 h-4 text-primary absolute top-3 right-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What industry are you in? <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Sports agency, Music, Tech startup, Restaurant..."
              value={answers.industry}
              onChange={(e) => set("industry", e.target.value)}
              className="bg-background/50 h-11"
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Describe your company, business, or personal goals
            </label>
            <Textarea
              placeholder="e.g. I run a sports agency that represents NBA athletes. My goal is to streamline player management, contracts, and relocation workflows..."
              value={answers.description}
              onChange={(e) => set("description", e.target.value)}
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          {/* Problems */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What problems are you trying to solve?
            </label>
            <Textarea
              placeholder="e.g. Keeping track of player deals, managing sponsorships, coordinating relocation logistics..."
              value={answers.problems}
              onChange={(e) => set("problems", e.target.value)}
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          {/* Workflows */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What workflows do you want to improve?
            </label>
            <Textarea
              placeholder="e.g. Onboarding new clients, tracking campaign performance, scheduling across my team..."
              value={answers.workflows}
              onChange={(e) => set("workflows", e.target.value)}
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What tools or features would help you the most?
            </label>
            <Textarea
              placeholder="e.g. A CRM for clients, AI-powered content generation, a Gantt chart, financial tracking..."
              value={answers.desired_features}
              onChange={(e) => set("desired_features", e.target.value)}
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What are your interests or areas of focus?
            </label>
            <Textarea
              placeholder="e.g. Basketball, hip-hop, content creation, real estate, web development, fitness, trading..."
              value={answers.interests}
              onChange={(e) => set("interests", e.target.value)}
              className="bg-background/50 min-h-[100px] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pb-8">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2 h-12 text-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting up your dashboard...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Go to My Dashboard</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
