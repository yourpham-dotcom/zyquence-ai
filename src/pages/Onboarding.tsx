import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type OnboardingAnswers } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Building2, User, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ELITE_EMAILS = ["yourpham@gmail.com", "illestrj.12@gmail.com", "asantimokwala48@gmail.com"];

const STEPS = [
  {
    id: 1,
    title: "Let's get to know you",
    subtitle: "Tell us a bit about who you are",
  },
  {
    id: 2,
    title: "Your goals",
    subtitle: "Help us understand what you're working toward",
  },
  {
    id: 3,
    title: "Your workflow",
    subtitle: "Tell us how you work and what slows you down",
  },
  {
    id: 4,
    title: "Your interests",
    subtitle: "What areas are you focused on?",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProfile } = useOnboarding();
  const [step, setStep] = useState(1);
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

  const canAdvance = () => {
    if (step === 1) return answers.account_type !== "" && answers.industry.trim() !== "";
    if (step === 2) return answers.description.trim() !== "";
    if (step === 3) return answers.workflows.trim() !== "";
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
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

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40">
        <span className="text-lg font-bold tracking-tight text-foreground">Zyquence</span>
        <span className="text-xs text-muted-foreground font-medium">
          Step {step} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-border/30">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8">

          {/* Step header */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {STEPS[step - 1].subtitle}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {STEPS[step - 1].title}
            </h1>
          </div>

          {/* Step 1: Account type + Industry */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Are you using Zyquence as an individual or a company?
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
                        "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all",
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  What industry are you in?
                </label>
                <Input
                  placeholder="e.g. Sports agency, Music, Tech startup, Restaurant..."
                  value={answers.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  className="bg-background/50 h-11"
                />
              </div>
            </div>
          )}

          {/* Step 2: Goals + Problems */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Describe your company, business, or personal goals
                </label>
                <Textarea
                  placeholder="e.g. I run a sports agency that represents NBA athletes. My goal is to streamline player management, contracts, and relocation workflows..."
                  value={answers.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="bg-background/50 min-h-[120px] resize-none"
                />
              </div>

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
            </div>
          )}

          {/* Step 3: Workflows + Features */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  What workflows do you want to improve?
                </label>
                <Textarea
                  placeholder="e.g. Onboarding new clients, tracking campaign performance, scheduling and coordinating across my team..."
                  value={answers.workflows}
                  onChange={(e) => set("workflows", e.target.value)}
                  className="bg-background/50 min-h-[110px] resize-none"
                />
              </div>

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
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  What are your interests or areas of focus?
                </label>
                <Textarea
                  placeholder="e.g. Basketball, hip-hop, content creation, real estate, web development, fitness, trading..."
                  value={answers.interests}
                  onChange={(e) => set("interests", e.target.value)}
                  className="bg-background/50 min-h-[140px] resize-none"
                />
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-1">
                <p className="text-xs font-semibold text-foreground">Almost done!</p>
                <p className="text-xs text-muted-foreground">
                  Based on your answers, we'll personalize your dashboard with the tools and features most relevant to you.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="gap-2 px-6"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 px-8"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Go to Dashboard</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
