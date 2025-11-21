import { useState, useEffect } from "react";
import { Copy, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CollaborationPanelProps {
  projectId?: string;
}

const CollaborationPanel = ({ projectId }: CollaborationPanelProps) => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (projectId) {
      loadCollaborators();
      generateShareLink();
    }
  }, [projectId]);

  const loadCollaborators = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from("project_collaborators")
      .select("*")
      .eq("project_id", projectId);

    if (!error && data) {
      setCollaborators(data);
    }
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}/studio/music/${projectId}`;
    setShareLink(link);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  const addCollaborator = async () => {
    if (!projectId || !newEmail) return;

    try {
      const { error } = await supabase
        .from("project_collaborators")
        .insert({
          project_id: projectId,
          user_id: newEmail, // TODO: Look up user by email
          permission: "editor",
        });

      if (error) throw error;

      setNewEmail("");
      loadCollaborators();
      toast({
        title: "Collaborator added",
        description: "Invitation sent successfully",
      });
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        title: "Error",
        description: "Could not add collaborator",
        variant: "destructive",
      });
    }
  };

  const removeCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from("project_collaborators")
        .delete()
        .eq("id", id);

      if (error) throw error;

      loadCollaborators();
      toast({ title: "Collaborator removed" });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Error",
        description: "Could not remove collaborator",
        variant: "destructive",
      });
    }
  };

  if (!projectId) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Save your project first to enable collaboration</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-semibold">Collaboration</h3>

        {/* Share Link */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Share Link</h4>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly />
            <Button onClick={copyShareLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Anyone with this link can view and edit this project
          </p>
        </Card>

        {/* Invite Collaborators */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Invite Collaborators</h4>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCollaborator()}
            />
            <Button onClick={addCollaborator}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>

          {/* Collaborators List */}
          <div className="space-y-2">
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators yet
              </p>
            ) : (
              collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{collab.user_id}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {collab.permission}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaborator(collab.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CollaborationPanel;