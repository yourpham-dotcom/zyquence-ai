import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, AlertTriangle, CheckCircle, Mail, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SportsCybersecurity = () => {
  const [emailContent, setEmailContent] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScanEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste an email to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          input: emailContent,
          type: "cybersecurity_scan"
        },
      });

      if (error) throw error;

      setScanResult(data);
      
      const isSafe = data.threatLevel === "low" || data.threatLevel === "safe";
      toast({
        title: isSafe ? "Email Appears Safe" : "Potential Threat Detected",
        description: isSafe 
          ? "No major red flags found" 
          : "This email shows signs of being fraudulent",
        variant: isSafe ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error("Scan error:", error);
      toast({
        title: "Scan Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sports Cybersecurity</h2>
            <p className="text-sm text-muted-foreground">Detect fake recruiting emails and prevent scams</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Common Red Flags</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Suspicious email addresses</li>
            <li>• Urgent financial requests</li>
            <li>• Poor grammar/spelling</li>
            <li>• Unverified school domains</li>
            <li>• Request for personal info</li>
            <li>• Too-good-to-be-true offers</li>
          </ul>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Verified Indicators</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Official .edu domain</li>
            <li>• Coach contact info</li>
            <li>• School phone number</li>
            <li>• Professional language</li>
            <li>• Verifiable details</li>
            <li>• No payment requests</li>
          </ul>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Protection Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Verify sender identity</li>
            <li>• Check school website</li>
            <li>• Call athletic department</li>
            <li>• Never share banking info</li>
            <li>• Report suspicious emails</li>
            <li>• Trust your instincts</li>
          </ul>
        </Card>
      </div>

      <Card className="flex-1 p-6 bg-card border-border flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Email Scanner</h3>
        </div>

        <Textarea
          placeholder="Paste the recruiting email here to scan for potential scams or fraud..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          className="flex-1 mb-4 min-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground"
        />

        <Button 
          onClick={handleScanEmail}
          disabled={isScanning}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Scan Email for Threats
            </>
          )}
        </Button>

        {scanResult && (
          <Card className={`p-4 ${
            scanResult.threatLevel === "high" 
              ? "bg-destructive/10 border-destructive/30" 
              : "bg-primary/5 border-primary/20"
          }`}>
            <div className="flex items-start gap-3">
              {scanResult.threatLevel === "high" ? (
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">
                  Threat Level: {scanResult.threatLevel?.toUpperCase()}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">{scanResult.analysis}</p>
                
                {scanResult.redFlags && scanResult.redFlags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground mb-1">Red Flags Detected:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {scanResult.redFlags.map((flag: string, idx: number) => (
                        <li key={idx}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {scanResult.recommendation && (
                  <div className="mt-3 p-3 bg-background/50 rounded">
                    <p className="text-sm font-semibold text-foreground mb-1">Recommendation:</p>
                    <p className="text-sm text-muted-foreground">{scanResult.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default SportsCybersecurity;
