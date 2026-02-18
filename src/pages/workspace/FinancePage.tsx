import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { title: "Income", value: "$4,200", icon: TrendingUp, change: "+12%", positive: true, gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-500" },
  { title: "Expenses", value: "$2,680", icon: TrendingDown, change: "-3%", positive: true, gradient: "from-red-500/10 to-orange-500/10", iconColor: "text-red-500" },
  { title: "Net Worth", value: "$18,520", icon: DollarSign, change: "+8%", positive: true, gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-500" },
  { title: "Savings", value: "$1,520", icon: PiggyBank, change: "+5%", positive: true, gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-500" },
];

const budgetCategories = [
  { name: "Food & Dining", spent: 420, budget: 600, color: "bg-orange-500" },
  { name: "Transportation", spent: 180, budget: 300, color: "bg-blue-500" },
  { name: "Entertainment", spent: 95, budget: 200, color: "bg-purple-500" },
  { name: "Health & Fitness", spent: 120, budget: 150, color: "bg-emerald-500" },
  { name: "Shopping", spent: 310, budget: 400, color: "bg-pink-500" },
];

const FinancePage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 overflow-hidden">
            <CardContent className={cn("p-4 bg-gradient-to-br", stat.gradient)}>
              <stat.icon className={cn("h-5 w-5 mb-2", stat.iconColor)} />
              <p className="text-xs text-muted-foreground">{stat.title}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <span className={cn("text-[10px] font-medium", stat.positive ? "text-emerald-500" : "text-red-500")}>
                {stat.change} this month
              </span>
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
          {budgetCategories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{cat.name}</span>
                <span className="text-muted-foreground text-xs">
                  ${cat.spent} / ${cat.budget}
                </span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", cat.color)}
                  style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePage;
