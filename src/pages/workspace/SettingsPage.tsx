import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Bell, Moon, Globe, Shield, LogOut, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import FocusAreasSettings from "@/components/workspace/FocusAreasSettings";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (setter: (v: boolean) => void) => (value: boolean) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay for preferences
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setHasChanges(false);
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-500">
                <Crown className="h-3.5 w-3.5" /> Pro Plan
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Free Plan</span>
                <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={handleToggle(setNotifications)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Use dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleToggle(setDarkMode)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Public Profile</p>
                <p className="text-xs text-muted-foreground">Allow others to find you</p>
              </div>
            </div>
            <Switch checked={publicProfile} onCheckedChange={handleToggle(setPublicProfile)} />
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <FocusAreasSettings />

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" /> Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your data is encrypted and securely stored. For account changes, contact support.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full"
      >
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="mr-2 h-4 w-4" /> Save Settings</>
        )}
      </Button>

      {/* Sign Out */}
      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
};

export default SettingsPage;
