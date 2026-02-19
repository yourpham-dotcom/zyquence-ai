import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, Pencil, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import FinancialAdvisor from "@/components/workspace/FinancialAdvisor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "zyquence-budget";

interface BudgetItem {
  id: string;
  description: string;
  amount: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
  items: BudgetItem[];
}

interface BudgetData {
  income: number;
  expenses: number;
  netWorth: number;
  savings: number;
  categories: BudgetCategory[];
}

const CATEGORY_COLORS = [
  "bg-orange-500", "bg-blue-500", "bg-purple-500",
  "bg-emerald-500", "bg-pink-500", "bg-yellow-500", "bg-cyan-500",
];

const defaultBudget: BudgetData = {
  income: 4200,
  expenses: 2680,
  netWorth: 18520,
  savings: 1520,
  categories: [
    { id: "1", name: "Food & Dining", spent: 420, budget: 600, color: "bg-orange-500", items: [] },
    { id: "2", name: "Transportation", spent: 180, budget: 300, color: "bg-blue-500", items: [] },
    { id: "3", name: "Entertainment", spent: 95, budget: 200, color: "bg-purple-500", items: [] },
    { id: "4", name: "Health & Fitness", spent: 120, budget: 150, color: "bg-emerald-500", items: [] },
    { id: "5", name: "Shopping", spent: 310, budget: 400, color: "bg-pink-500", items: [] },
  ],
};

const FinancePage = () => {
  const [budget, setBudget] = useState<BudgetData>(defaultBudget);
  const [showDialog, setShowDialog] = useState(false);
  const [draft, setDraft] = useState<BudgetData>(defaultBudget);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try {
      const parsed = JSON.parse(saved);
      // Ensure items array exists on each category (migration)
      parsed.categories = parsed.categories.map((c: any) => ({ ...c, items: c.items || [] }));
      setBudget(parsed);
    } catch {}
  }, []);

  const save = (data: BudgetData) => {
    setBudget(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Inline item editing (on the main page) ---
  const addItem = (catId: string) => {
    const updated: BudgetData = {
      ...budget,
      categories: budget.categories.map((c) =>
        c.id === catId
          ? { ...c, items: [...c.items, { id: crypto.randomUUID(), description: "", amount: 0 }] }
          : c
      ),
    };
    save(updated);
  };

  const updateItem = (catId: string, itemId: string, field: "description" | "amount", value: string | number) => {
    const updated: BudgetData = {
      ...budget,
      categories: budget.categories.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
            }
          : c
      ),
    };
    // Recalculate spent from items if items exist
    updated.categories = updated.categories.map((c) => {
      if (c.items.length > 0) {
        const totalFromItems = c.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
        return { ...c, spent: totalFromItems };
      }
      return c;
    });
    const totalSpent = updated.categories.reduce((s, c) => s + c.spent, 0);
    updated.expenses = totalSpent;
    updated.savings = updated.income - totalSpent > 0 ? updated.income - totalSpent : 0;
    save(updated);
  };

  const removeItem = (catId: string, itemId: string) => {
    const updated: BudgetData = {
      ...budget,
      categories: budget.categories.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
      ),
    };
    // Recalculate
    updated.categories = updated.categories.map((c) => {
      if (c.items.length > 0) {
        return { ...c, spent: c.items.reduce((s, it) => s + (Number(it.amount) || 0), 0) };
      }
      return c;
    });
    const totalSpent = updated.categories.reduce((s, c) => s + c.spent, 0);
    updated.expenses = totalSpent;
    updated.savings = updated.income - totalSpent > 0 ? updated.income - totalSpent : 0;
    save(updated);
  };
  const clearItems = (catId: string) => {
    const updated: BudgetData = {
      ...budget,
      categories: budget.categories.map((c) =>
        c.id === catId ? { ...c, items: [], spent: 0 } : c
      ),
    };
    const totalSpent = updated.categories.reduce((s, c) => s + c.spent, 0);
    updated.expenses = totalSpent;
    updated.savings = updated.income - totalSpent > 0 ? updated.income - totalSpent : 0;
    save(updated);
  };

  // --- Dialog editing ---
  const openEditor = () => {
    setDraft({ ...budget, categories: budget.categories.map((c) => ({ ...c, items: c.items.map((it) => ({ ...it })) })) });
    setShowDialog(true);
  };

  const handleSave = () => {
    const totalSpent = draft.categories.reduce((s, c) => s + c.spent, 0);
    const savingsCalc = draft.income - totalSpent;
    save({
      ...draft,
      expenses: totalSpent,
      savings: savingsCalc > 0 ? savingsCalc : 0,
    });
    setShowDialog(false);
    toast.success("Budget updated");
  };

  const addCategoryDraft = () => {
    setDraft((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: crypto.randomUUID(),
          name: "",
          spent: 0,
          budget: 0,
          color: CATEGORY_COLORS[prev.categories.length % CATEGORY_COLORS.length],
          items: [],
        },
      ],
    }));
  };

  const removeCategoryDraft = (id: string) => {
    setDraft((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  };

  const updateCategoryDraft = (id: string, field: keyof BudgetCategory, value: string | number) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const stats = [
    { title: "Income", value: budget.income, icon: TrendingUp, gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-500" },
    { title: "Expenses", value: budget.expenses, icon: TrendingDown, gradient: "from-red-500/10 to-orange-500/10", iconColor: "text-red-500" },
    { title: "Net Worth", value: budget.netWorth, icon: DollarSign, gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-500" },
    { title: "Savings", value: budget.savings, icon: PiggyBank, gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance</h1>
        <Button size="sm" className="rounded-xl" onClick={openEditor}>
          <Pencil className="h-4 w-4 mr-1.5" />
          My Budget
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 overflow-hidden">
            <CardContent className={cn("p-4 bg-gradient-to-br", stat.gradient)}>
              <stat.icon className={cn("h-5 w-5 mb-2", stat.iconColor)} />
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className="text-xl font-bold text-foreground">${stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Categories with Dropdowns */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Budget Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {budget.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet. Click "My Budget" to add some.
            </p>
          ) : (
            budget.categories.map((cat) => {
              const isOpen = expandedCats.has(cat.id);
              return (
                <div key={cat.id} className="rounded-xl border border-border/30 overflow-hidden bg-background">
                  {/* Category Header - clickable */}
                  <button
                    onClick={() => toggleExpand(cat.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <div className={cn("w-1.5 h-6 rounded-full shrink-0", cat.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={cn("h-full rounded-full transition-all", cat.color)}
                          style={{ width: `${cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Items */}
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border/20 bg-accent/10">
                      {cat.items.length === 0 && (
                        <p className="text-xs text-muted-foreground py-1">No items yet. Add one below.</p>
                      )}
                      {cat.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(cat.id, item.id, "description", e.target.value)}
                            className="flex-1 h-8 text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={item.amount || ""}
                              onChange={(e) => updateItem(cat.id, item.id, "amount", Number(e.target.value))}
                              className="w-20 h-8 text-xs"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeItem(cat.id, item.id)}
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => addItem(cat.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Item
                      </Button>
                      {cat.items.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => clearItems(cat.id)}
                        >
                          <X className="h-3 w-3 mr-1" /> Clear All
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Financial Advisor AI */}
      <FinancialAdvisor budgetData={budget} />

      {/* Budget Editor Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Budget</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Income</label>
              <Input
                type="number"
                value={draft.income}
                onChange={(e) => setDraft((p) => ({ ...p, income: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Net Worth</label>
              <Input
                type="number"
                value={draft.netWorth}
                onChange={(e) => setDraft((p) => ({ ...p, netWorth: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Categories</h3>
            {draft.categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className={cn("w-2 h-8 rounded-full shrink-0", cat.color)} />
                <Input
                  placeholder="Category"
                  value={cat.name}
                  onChange={(e) => updateCategoryDraft(cat.id, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Spent"
                  value={cat.spent || ""}
                  onChange={(e) => updateCategoryDraft(cat.id, "spent", Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">/</span>
                <Input
                  type="number"
                  placeholder="Budget"
                  value={cat.budget || ""}
                  onChange={(e) => updateCategoryDraft(cat.id, "budget", Number(e.target.value))}
                  className="w-20"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeCategoryDraft(cat.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCategoryDraft} className="w-full">
              <Plus className="h-3 w-3 mr-1" /> Add Category
            </Button>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Budget
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancePage;
