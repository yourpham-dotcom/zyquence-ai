import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Trash2, Loader2, Send, Bot, User, Package,
  Pencil, Save, X, AlertTriangle, ScanLine, Clock
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScanDrop from "./ScanDrop";
import WorkLogSpreadsheet, { type WorkLogSpreadsheetHandle } from "./WorkLogSpreadsheet";
import WorkLogScanDrop from "./WorkLogScanDrop";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  sku: string | null;
  location: string | null;
  min_stock: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  onBack: () => void;
};

export default function InventoryManagement({ onBack }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! I'm your inventory assistant. Tell me what to do — like \"Add 50 t-shirts at $12 each\" or \"Update laptop quantity to 25\"." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<InventoryItem>>({});
  const [scanDropOpen, setScanDropOpen] = useState(false);
  const [workLogScanOpen, setWorkLogScanOpen] = useState(false);
  const [workLogRefreshKey, setWorkLogRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("inventory");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WorkLog chat state
  const [wlChatMessages, setWlChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! I'm your WorkLog assistant. Try \"Add John 9am-5pm at $20/hr\" or \"Delete Sarah's entry from today\"." }
  ]);
  const [wlChatInput, setWlChatInput] = useState("");
  const [wlChatLoading, setWlChatLoading] = useState(false);
  const wlChatEndRef = useRef<HTMLDivElement>(null);
  const workLogRef = useRef<WorkLogSpreadsheetHandle>(null);
  const workLogsRef = useRef<any[]>([]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    wlChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [wlChatMessages]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data as unknown as InventoryItem[]);
    setLoading(false);
  };

  const addBlankItem = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("inventory_items").insert({
      user_id: user.id,
      name: "New Item",
      quantity: 0,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const newItem = data as unknown as InventoryItem;
    setItems(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
    setEditValues(newItem);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("inventory_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValues({ ...item });
  };

  const saveEdit = async () => {
    if (!editingId || !editValues) return;
    const { error } = await supabase.from("inventory_items").update({
      name: editValues.name,
      category: editValues.category,
      quantity: editValues.quantity,
      unit: editValues.unit,
      unit_price: editValues.unit_price,
      sku: editValues.sku,
      location: editValues.location,
      min_stock: editValues.min_stock,
      notes: editValues.notes,
      updated_at: new Date().toISOString(),
    }).eq("id", editingId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...editValues, updated_at: new Date().toISOString() } : i));
    setEditingId(null);
    setEditValues({});
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("inventory-chat", {
        body: { message: userMsg, inventory: items },
      });

      if (error) throw error;

      const response = data as { action: string; message: string; results?: any[]; error?: string };
      if (response.error) throw new Error(response.error);

      setChatMessages(prev => [...prev, { role: "assistant", content: response.message }]);

      if (response.action === "add" || response.action === "update" || response.action === "delete") {
        await fetchInventory();
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendWlChat = async () => {
    if (!wlChatInput.trim() || wlChatLoading) return;
    const userMsg = wlChatInput.trim();
    setWlChatInput("");
    setWlChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setWlChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("worklog-chat", {
        body: { message: userMsg, workLogs: workLogsRef.current },
      });

      if (error) throw error;

      const response = data as { action: string; message: string; results?: any[]; error?: string };
      if (response.error) throw new Error(response.error);

      setWlChatMessages(prev => [...prev, { role: "assistant", content: response.message }]);

      if (response.action === "add" || response.action === "update" || response.action === "delete") {
        // Refresh the spreadsheet
        workLogRef.current?.refresh();
      }
    } catch (e: any) {
      setWlChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setWlChatLoading(false);
    }
  };

  const handleLogsChange = useCallback((logs: any[]) => {
    workLogsRef.current = logs;
  }, []);

  const lowStockItems = items.filter(i => i.quantity <= i.min_stock && i.min_stock > 0);
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.unit_price || 0)), 0);

  const renderChatPanel = (
    messages: ChatMessage[],
    input: string,
    setInput: (v: string) => void,
    isLoading: boolean,
    onSend: () => void,
    endRef: React.RefObject<HTMLDivElement>,
    title: string,
    placeholder: string
  ) => (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="p-3 pb-2 border-b border-border">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && <Bot className="h-5 w-5 mt-0.5 text-primary shrink-0" />}
              <div className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-foreground"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && <User className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <Bot className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div className="bg-muted rounded-lg px-3 py-2 text-xs"><Loader2 className="h-3 w-3 animate-spin" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border">
        <form onSubmit={e => { e.preventDefault(); onSend(); }} className="flex gap-2">
          <Input
            className="h-8 text-xs"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button size="icon" className="h-8 w-8 shrink-0" type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Inventory & WorkLog</h1>
          <p className="text-xs text-muted-foreground">{items.length} items · ${totalValue.toLocaleString()} total value</p>
        </div>
        {activeTab === "inventory" && (
          <>
            <Button size="sm" variant="outline" onClick={() => setScanDropOpen(true)}><ScanLine className="h-4 w-4 mr-1" /> ScanDrop</Button>
            <Button size="sm" onClick={addBlankItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
          </>
        )}
        {activeTab === "worklog" && (
          <Button size="sm" variant="outline" onClick={() => setWorkLogScanOpen(true)}><Clock className="h-4 w-4 mr-1" /> Scan Work Log</Button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && activeTab === "inventory" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">{lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} low on stock</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory" className="gap-1.5"><Package className="h-3.5 w-3.5" /> Inventory</TabsTrigger>
          <TabsTrigger value="worklog" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> WorkLog</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Spreadsheet */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-2 font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Category</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Qty</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Unit</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Price</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">SKU</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Location</th>
                          <th className="text-center p-2 font-medium text-muted-foreground w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={8} className="text-center p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></td></tr>
                        ) : items.length === 0 ? (
                          <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">No items yet. Add one or tell the chatbot!</td></tr>
                        ) : items.map(item => (
                          <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/30 ${item.quantity <= item.min_stock && item.min_stock > 0 ? "bg-amber-500/5" : ""}`}>
                            {editingId === item.id ? (
                              <>
                                <td className="p-1"><Input className="h-7 text-xs" value={editValues.name || ""} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs" value={editValues.category || ""} onChange={e => setEditValues(v => ({ ...v, category: e.target.value }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs text-right" type="number" value={editValues.quantity ?? 0} onChange={e => setEditValues(v => ({ ...v, quantity: parseInt(e.target.value) || 0 }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs" value={editValues.unit || ""} onChange={e => setEditValues(v => ({ ...v, unit: e.target.value }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs text-right" type="number" step="0.01" value={editValues.unit_price ?? 0} onChange={e => setEditValues(v => ({ ...v, unit_price: parseFloat(e.target.value) || 0 }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs" value={editValues.sku || ""} onChange={e => setEditValues(v => ({ ...v, sku: e.target.value }))} /></td>
                                <td className="p-1"><Input className="h-7 text-xs" value={editValues.location || ""} onChange={e => setEditValues(v => ({ ...v, location: e.target.value }))} /></td>
                                <td className="p-1 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEdit}><Save className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-2 font-medium">{item.name}</td>
                                <td className="p-2"><Badge variant="secondary" className="text-[10px]">{item.category}</Badge></td>
                                <td className="p-2 text-right font-mono">{item.quantity}</td>
                                <td className="p-2 text-muted-foreground">{item.unit}</td>
                                <td className="p-2 text-right font-mono">${(item.unit_price || 0).toFixed(2)}</td>
                                <td className="p-2 text-muted-foreground">{item.sku || "—"}</td>
                                <td className="p-2 text-muted-foreground">{item.location || "—"}</td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(item)}><Pencil className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Chat Panel */}
            <div className="lg:col-span-1">
              {renderChatPanel(
                chatMessages, chatInput, setChatInput, chatLoading, sendChat, chatEndRef,
                "Inventory Assistant",
                "e.g. Add 100 widgets at $5 each..."
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="worklog" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WorkLogSpreadsheet ref={workLogRef} refreshKey={workLogRefreshKey} onLogsChange={handleLogsChange} />
            </div>
            <div className="lg:col-span-1">
              {renderChatPanel(
                wlChatMessages, wlChatInput, setWlChatInput, wlChatLoading, sendWlChat, wlChatEndRef,
                "WorkLog Assistant",
                'e.g. Add John 9am-5pm at $20/hr...'
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ScanDrop open={scanDropOpen} onOpenChange={setScanDropOpen} onItemsAdded={fetchInventory} />
      <WorkLogScanDrop open={workLogScanOpen} onOpenChange={setWorkLogScanOpen} onEntriesAdded={() => setWorkLogRefreshKey(k => k + 1)} />
    </div>
  );
}
