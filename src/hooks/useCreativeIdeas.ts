import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface CIIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  idea_score: number | null;
  market_potential: number | null;
  execution_complexity: number | null;
  risk_level: number | null;
  trend_alignment: number | null;
  ai_analysis: any;
  ai_strategy: any;
  created_at: string;
  updated_at: string;
}

export const useCreativeIdeas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ideasQuery = useQuery({
    queryKey: ["ci-ideas", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ci_ideas")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CIIdea[];
    },
    enabled: !!user?.id,
  });

  const saveIdea = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const { data, error } = await (supabase as any)
        .from("ci_ideas")
        .insert({ user_id: user!.id, title, description, status: "draft" })
        .select()
        .single();
      if (error) throw error;
      return data as CIIdea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ci-ideas"] });
      toast({ title: "Idea saved!" });
    },
    onError: (e: Error) => toast({ title: "Error saving idea", description: e.message, variant: "destructive" }),
  });

  const analyzeIdea = useMutation({
    mutationFn: async ({ title, description, ideaId }: { title: string; description: string; ideaId?: string }) => {
      let id = ideaId;
      if (!id) {
        const { data, error } = await (supabase as any)
          .from("ci_ideas")
          .insert({ user_id: user!.id, title, description, status: "analyzing" })
          .select()
          .single();
        if (error) throw error;
        id = data.id;
      } else {
        await (supabase as any).from("ci_ideas").update({ status: "analyzing" }).eq("id", id);
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke("creative-intelligence", {
        body: { action: "analyze", title, description },
      });
      if (fnError) throw fnError;

      const result = fnData.result;
      const { error: updateError } = await (supabase as any)
        .from("ci_ideas")
        .update({
          status: "analyzed",
          idea_score: result.idea_score,
          market_potential: result.market_potential,
          execution_complexity: result.execution_complexity,
          risk_level: result.risk_level,
          trend_alignment: result.trend_alignment,
          ai_analysis: result,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (updateError) throw updateError;
      return { id, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ci-ideas"] });
      toast({ title: "Idea analyzed!" });
    },
    onError: (e: Error) => toast({ title: "Analysis failed", description: e.message, variant: "destructive" }),
  });

  const generateStrategy = useMutation({
    mutationFn: async (idea: CIIdea) => {
      await (supabase as any).from("ci_ideas").update({ status: "generating strategy" }).eq("id", idea.id);

      const { data: fnData, error: fnError } = await supabase.functions.invoke("creative-intelligence", {
        body: { action: "strategy", idea },
      });
      if (fnError) throw fnError;

      const { error: updateError } = await (supabase as any)
        .from("ci_ideas")
        .update({
          status: "strategy ready",
          ai_strategy: fnData.result,
          updated_at: new Date().toISOString(),
        })
        .eq("id", idea.id);
      if (updateError) throw updateError;
      return fnData.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ci-ideas"] });
      toast({ title: "Strategy generated!" });
    },
    onError: (e: Error) => toast({ title: "Strategy generation failed", description: e.message, variant: "destructive" }),
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("ci_ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ci-ideas"] });
      toast({ title: "Idea deleted" });
    },
  });

  return {
    ideas: ideasQuery.data ?? [],
    isLoading: ideasQuery.isLoading,
    saveIdea,
    analyzeIdea,
    generateStrategy,
    deleteIdea,
  };
};
