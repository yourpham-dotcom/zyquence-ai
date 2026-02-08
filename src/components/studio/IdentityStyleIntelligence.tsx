import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Upload, Copy, Download, Loader2, User, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "./CameraCapture";

const IdentityStyleIntelligence = () => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [stylePhoto, setStylePhoto] = useState<string | null>(null);
  const [styledResult, setStyledResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [styleUrl, setStyleUrl] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"user" | "style">("user");
  const userFileRef = useRef<HTMLInputElement>(null);
  const styleFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCameraCapture = (dataUrl: string) => {
    if (cameraTarget === "user") {
      setUserPhoto(dataUrl);
      setStyledResult(null);
    } else {
      setStylePhoto(dataUrl);
    }
    toast({
      title: "Photo Captured",
      description: "Your camera photo has been loaded",
    });
  };

  const openCamera = (target: "user" | "style") => {
    setCameraTarget(target);
    setShowCamera(true);
  };

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhoto(event.target?.result as string);
        setStyledResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStylePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStylePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteFromUrl = async () => {
    if (!styleUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(styleUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (event) => {
        setStylePhoto(event.target?.result as string);
        toast({
          title: "Style Image Loaded",
          description: "Successfully loaded image from URL",
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      toast({
        title: "Failed to Load Image",
        description: "Could not load image from the provided URL",
        variant: "destructive",
      });
    }
  };

  const handleApplyStyle = async () => {
    if (!userPhoto) {
      toast({
        title: "Missing Photo",
        description: "Please upload your photo first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("style-transfer", {
        body: {
          userImage: userPhoto,
          styleImage: stylePhoto,
          prompt: stylePhoto 
            ? "Transfer the clothing style and hairstyle from the reference image to the person in the first image. Keep the person's face natural and maintain realistic proportions."
            : "Give this person a stylish modern outfit and trendy hairstyle. Make it look natural and fashionable."
        },
      });

      if (error) throw error;

      if (data?.image) {
        setStyledResult(data.image);
        toast({
          title: "Style Applied!",
          description: "Your styled photo is ready",
        });
      }
    } catch (error: any) {
      console.error("Style transfer error:", error);
      toast({
        title: "Style Transfer Failed",
        description: error.message || "Failed to apply style. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!styledResult) return;
    
    const link = document.createElement("a");
    link.href = styledResult;
    link.download = `styled-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "Your styled photo has been saved",
    });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Identity Style Intelligence</h2>
            <p className="text-sm text-muted-foreground">AI-powered virtual style try-on</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Photo Upload */}
        <Card className="p-6 flex flex-col gap-4 bg-card border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Photo</h3>
          </div>
          
          <div 
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/5"
            onClick={() => userFileRef.current?.click()}
          >
            {userPhoto ? (
              <img src={userPhoto} alt="Your photo" className="max-h-64 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Click to upload your photo</p>
              </>
            )}
          </div>
          
          <input
            ref={userFileRef}
            type="file"
            accept="image/*"
            onChange={handleUserPhotoUpload}
            className="hidden"
          />
          
          <Button 
            onClick={() => userFileRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          <Button 
            onClick={() => openCamera("user")}
            variant="outline"
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </Card>

        {/* Style Reference */}
        <Card className="p-6 flex flex-col gap-4 bg-card border-border">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Style Reference</h3>
          </div>
          
          <div 
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/5"
            onClick={() => styleFileRef.current?.click()}
          >
            {stylePhoto ? (
              <img src={stylePhoto} alt="Style reference" className="max-h-64 rounded-lg object-contain" />
            ) : (
              <>
                <Copy className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Upload or paste style image</p>
              </>
            )}
          </div>
          
          <input
            ref={styleFileRef}
            type="file"
            accept="image/*"
            onChange={handleStylePhotoUpload}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Button 
              onClick={() => styleFileRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Style Image
            </Button>
            <Button 
              onClick={() => openCamera("style")}
              variant="outline"
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo of Style
            </Button>
            
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL from Depop, eBay, etc."
                value={styleUrl}
                onChange={(e) => setStyleUrl(e.target.value)}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button onClick={handlePasteFromUrl} size="icon" variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Pro tip: Right-click images on Depop, Grailed, or eBay and copy the image URL
            </p>
          </div>
        </Card>

        {/* Result */}
        <Card className="p-6 flex flex-col gap-4 bg-card border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Styled Result</h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/5">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Applying AI style transfer...</p>
              </div>
            ) : styledResult ? (
              <img src={styledResult} alt="Styled result" className="max-h-64 rounded-lg object-contain" />
            ) : (
              <>
                <Sparkles className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Your styled photo will appear here</p>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleApplyStyle}
              disabled={!userPhoto || isProcessing}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply Style with AI
                </>
              )}
            </Button>
            
            {styledResult && (
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Result
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">How it works</h4>
            <p className="text-sm text-muted-foreground">
              1. Upload or take a photo of yourself using your camera
              <br />
              2. Upload a style reference, take a photo, or paste an image URL from fashion sites
              <br />
              3. Click "Apply Style with AI" to see yourself in that outfit and hairstyle
              <br />
              4. Download and share your styled photos!
            </p>
          </div>
        </div>
      </Card>

      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default IdentityStyleIntelligence;
