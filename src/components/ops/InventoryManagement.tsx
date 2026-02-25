import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Trash2, Loader2, Send, Bot, User, Package,
  Pencil, Save, X, AlertTriangle, ScanLine
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScanDrop from "./ScanDrop";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

      // Refresh inventory after mutation
      if (response.action === "add" || response.action === "update" || response.action === "delete") {
        await fetchInventory();
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const lowStockItems = items.filter(i => i.quantity <= i.min_stock && i.min_stock > 0);
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.unit_price || 0)), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Inventory Management</h1>
          <p className="text-xs text-muted-foreground">{items.length} items · ${totalValue.toLocaleString()} total value</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setScanDropOpen(true)}><ScanLine className="h-4 w-4 mr-1" /> ScanDrop</Button>
        <Button size="sm" onClick={addBlankItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">{lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} low on stock</span>
            </div>
          </CardContent>
        </Card>
      )}

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

        {/* Chat Panel */}
        <div className="lg:col-span-1">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="p-3 pb-2 border-b border-border">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Inventory Assistant
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((msg, i) => (
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
                {chatLoading && (
                  <div className="flex gap-2">
                    <Bot className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                    <div className="bg-muted rounded-lg px-3 py-2 text-xs"><Loader2 className="h-3 w-3 animate-spin" /></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border">
              <form onSubmit={e => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Add 100 widgets at $5 each..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <Button size="icon" className="h-8 w-8 shrink-0" type="submit" disabled={chatLoading || !chatInput.trim()}>
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      <ScanDrop open={scanDropOpen} onOpenChange={setScanDropOpen} onItemsAdded={fetchInventory} />
    </div>
  );
}
