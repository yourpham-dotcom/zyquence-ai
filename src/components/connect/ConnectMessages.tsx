import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityProfile } from "@/hooks/useCommunityProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  user_id: string;
  display_name: string;
  last_message: string;
  last_time: string;
  is_online: boolean;
}

const ConnectMessages = () => {
  const { user } = useAuth();
  const { ensureProfile } = useCommunityProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!user) return;
    await ensureProfile();

    const { data: msgs } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!msgs) return;

    const userMap = new Map<string, { last_message: string; last_time: string }>();
    msgs.forEach((m: any) => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!userMap.has(otherId)) {
        userMap.set(otherId, { last_message: m.content, last_time: m.created_at });
      }
    });

    const otherIds = [...userMap.keys()];
    if (!otherIds.length) { setConversations([]); return; }

    const { data: profiles } = await supabase
      .from("community_profiles")
      .select("user_id, display_name, is_online")
      .in("user_id", otherIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    setConversations(otherIds.map((id) => {
      const info = userMap.get(id)!;
      const prof = profileMap.get(id);
      return {
        user_id: id,
        display_name: prof?.display_name || "User",
        last_message: info.last_message,
        last_time: info.last_time,
        is_online: prof?.is_online || false,
      };
    }));
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { fetchConversations(); }, [user]);

  useEffect(() => {
    if (!selectedUser || !user) return;
    fetchMessages(selectedUser);

    const channel = supabase
      .channel(`dm-${selectedUser}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const msg = payload.new as any;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedUser) ||
            (msg.sender_id === selectedUser && msg.receiver_id === user.id)) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUser) return;
    await supabase.from("direct_messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const selectedConv = conversations.find((c) => c.user_id === selectedUser);

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Conversation List */}
      <div className="w-72 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground p-4">No conversations yet. Connect with someone to start chatting!</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => setSelectedUser(conv.user_id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50",
                selectedUser === conv.user_id && "bg-accent"
              )}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{conv.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                {conv.is_online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{conv.display_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{conv.last_message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {format(new Date(conv.last_time), "h:mm a")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{selectedConv?.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedConv?.is_online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-card" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConv?.display_name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedConv?.is_online ? "Online" : "Offline"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-accent text-foreground rounded-bl-md"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {format(new Date(msg.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                className="flex-1 bg-accent/50 rounded-xl px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()} size="icon" className="rounded-xl h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-1">Select a conversation</p>
              <p className="text-sm">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectMessages;
