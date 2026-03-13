import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery session from the email link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type === "recovery") {
      setIsValidSession(true);
      setLoading(false);
      return;
    }

    // Also check via auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setLoading(false);
      }
    });

    // Fallback: check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">Password Updated</CardTitle>
            <CardDescription>
              Your password has been changed. Redirecting to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Link
        to="/auth"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--cyber-blue)/0.1),transparent_50%)]" />

      <Card className="w-full max-w-md relative z-10 border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-gradient">Zyquence</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Set New Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cyber-blue hover:bg-cyber-blue/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
