import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityProfile } from "@/hooks/useCommunityProfile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profile?: { display_name: string; avatar_url: string | null };
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

const ConnectFeed = () => {
  const { user } = useAuth();
  const { ensureProfile } = useCommunityProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData) return;

    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("community_profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    const { data: likes } = await supabase.from("post_likes").select("post_id, user_id");
    const likesMap = new Map<string, { count: number; mine: boolean }>();
    (likes || []).forEach((l: any) => {
      const existing = likesMap.get(l.post_id) || { count: 0, mine: false };
      existing.count++;
      if (l.user_id === user?.id) existing.mine = true;
      likesMap.set(l.post_id, existing);
    });

    const { data: commentCounts } = await supabase.from("post_comments").select("post_id");
    const commentMap = new Map<string, number>();
    (commentCounts || []).forEach((c: any) => {
      commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1);
    });

    setPosts(postsData.map((p: any) => ({
      ...p,
      profile: profileMap.get(p.user_id) || { display_name: "User", avatar_url: null },
      likes_count: likesMap.get(p.id)?.count || 0,
      comments_count: commentMap.get(p.id) || 0,
      liked_by_me: likesMap.get(p.id)?.mine || false,
    })));
  };

  useEffect(() => {
    ensureProfile().then(() => fetchPosts());
  }, [user]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    await supabase.from("community_posts").insert({ user_id: user.id, content: newPost.trim() });
    setNewPost("");
    setPosting(false);
    fetchPosts();
    toast({ title: "Posted!", description: "Your post is live." });
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!data) return;
    const userIds = [...new Set(data.map((c: any) => c.user_id))];
    const { data: profiles } = await supabase.from("community_profiles").select("user_id, display_name").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    setComments((prev) => ({
      ...prev,
      [postId]: data.map((c: any) => ({ ...c, profile: profileMap.get(c.user_id) })),
    }));
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !user) return;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, content });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    loadComments(postId);
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    const newState = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: newState }));
    if (newState) loadComments(postId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Community Feed</h2>
        <p className="text-sm text-muted-foreground">Share updates with the Zyquence community</p>
      </div>

      {/* Compose */}
      <Card className="p-4 space-y-3">
        <Textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="min-h-[80px] resize-none bg-background"
        />
        <div className="flex justify-end">
          <Button onClick={handlePost} disabled={posting || !newPost.trim()} size="sm">
            <Send className="h-4 w-4 mr-1.5" /> Post
          </Button>
        </div>
      </Card>

      {/* Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {post.profile?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.profile?.display_name}</p>
              <p className="text-[11px] text-muted-foreground">{format(new Date(post.created_at), "MMM d, h:mm a")}</p>
            </div>
          </div>

          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => handleLike(post.id, post.liked_by_me)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${post.liked_by_me ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <Heart className={`h-4 w-4 ${post.liked_by_me ? "fill-current" : ""}`} />
              {post.likes_count || ""}
            </button>
            <button
              onClick={() => toggleComments(post.id)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments_count || ""}
            </button>
          </div>

          {showComments[post.id] && (
            <div className="pt-2 border-t border-border space-y-2">
              {(comments[post.id] || []).map((c: any) => (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-accent">{c.profile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs"><span className="font-medium text-foreground">{c.profile?.display_name}</span> <span className="text-muted-foreground">{c.content}</span></p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="flex-1 text-xs bg-accent/50 rounded-lg px-3 py-1.5 outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                />
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleComment(post.id)}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-1">No posts yet</p>
          <p className="text-sm">Be the first to share something with the community!</p>
        </div>
      )}
    </div>
  );
};

export default ConnectFeed;
