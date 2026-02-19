import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "zyquence-budget";

interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
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
    { id: "1", name: "Food & Dining", spent: 420, budget: 600, color: "bg-orange-500" },
    { id: "2", name: "Transportation", spent: 180, budget: 300, color: "bg-blue-500" },
    { id: "3", name: "Entertainment", spent: 95, budget: 200, color: "bg-purple-500" },
    { id: "4", name: "Health & Fitness", spent: 120, budget: 150, color: "bg-emerald-500" },
    { id: "5", name: "Shopping", spent: 310, budget: 400, color: "bg-pink-500" },
  ],
};

const FinancePage = () => {
  const [budget, setBudget] = useState<BudgetData>(defaultBudget);
  const [showDialog, setShowDialog] = useState(false);
  const [draft, setDraft] = useState<BudgetData>(defaultBudget);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try {
      const parsed = JSON.parse(saved);
      setBudget(parsed);
    } catch {}
  }, []);

  const save = (data: BudgetData) => {
    setBudget(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const openEditor = () => {
    setDraft({ ...budget, categories: budget.categories.map((c) => ({ ...c })) });
    setShowDialog(true);
  };

  const handleSave = () => {
    // Auto-calculate expenses from categories
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

  const addCategory = () => {
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
        },
      ],
    }));
  };

  const removeCategory = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  const updateCategory = (id: string, field: keyof BudgetCategory, value: string | number) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
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
              <p className="text-xl font-bold text-foreground">
                ${stat.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Categories */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Budget Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budget.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet. Click "My Budget" to add some.
            </p>
          ) : (
            budget.categories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{cat.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", cat.color)}
                    style={{ width: `${cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                  onChange={(e) => updateCategory(cat.id, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Spent"
                  value={cat.spent || ""}
                  onChange={(e) => updateCategory(cat.id, "spent", Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">/</span>
                <Input
                  type="number"
                  placeholder="Budget"
                  value={cat.budget || ""}
                  onChange={(e) => updateCategory(cat.id, "budget", Number(e.target.value))}
                  className="w-20"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeCategory(cat.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCategory} className="w-full">
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
