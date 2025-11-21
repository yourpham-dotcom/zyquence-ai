import { useState, useRef } from "react";
import { Mic, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecordingPanelProps {
  onRecordingComplete: (audioUrl: string) => void;
}

const RecordingPanel = ({ onRecordingComplete }: RecordingPanelProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      toast({ title: "Recording started" });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({ title: "Recording stopped" });
    }
  };

  const uploadRecording = async (blob: Blob) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from("music-files")
        .upload(fileName, blob);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("music-files")
        .getPublicUrl(data.path);

      onRecordingComplete(urlData.publicUrl);
      toast({ title: "Recording uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload recording",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("music-files")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("music-files")
        .getPublicUrl(data.path);

      onRecordingComplete(urlData.publicUrl);
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full p-6">
      <Card className="p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-6">Record or Upload Audio</h3>

        <div className="space-y-6">
          {/* Recording */}
          <div className="text-center">
            <div className="mb-4">
              {isRecording && (
                <div className="text-4xl font-mono text-primary mb-4">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                </div>
              )}
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                className="w-32 h-32 rounded-full"
              >
                {isRecording ? (
                  <Square className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Click to stop recording" : "Click to start recording"}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Upload */}
          <div className="text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload">
              <Button variant="outline" size="lg" asChild>
                <span>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Audio File
                </span>
              </Button>
            </label>
            <p className="text-sm text-muted-foreground mt-2">
              Supports MP3, WAV, OGG, and more
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecordingPanel;