import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, PiggyBank, BookOpen, Calculator, Target } from "lucide-react";

const FinancialLiteracy = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [budget, setBudget] = useState<any>(null);

  const calculateBudget = () => {
    const income = parseFloat(monthlyIncome);
    if (isNaN(income) || income <= 0) return;

    setBudget({
      savings: (income * 0.2).toFixed(2),
      necessities: (income * 0.5).toFixed(2),
      wants: (income * 0.3).toFixed(2),
    });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Financial Literacy Hub</h2>
            <p className="text-sm text-muted-foreground">Build wealth and manage your athlete finances</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <PiggyBank className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Smart Saving</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Learn strategies to save for your future, build emergency funds, and prepare for life after sports.
          </p>
          <Button variant="outline" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Investment Basics</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Understand stocks, bonds, and investment vehicles to grow your wealth over time.
          </p>
          <Button variant="outline" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Explore Options
          </Button>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Financial Goals</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Set realistic financial goals and track your progress toward financial independence.
          </p>
          <Button variant="outline" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Set Goals
          </Button>
        </Card>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Budget Calculator</h3>
        </div>

        <div className="max-w-md">
          <label className="text-sm text-muted-foreground mb-2 block">
            Monthly Income (including NIL, scholarships, part-time work)
          </label>
          <div className="flex gap-2 mb-6">
            <Input
              type="number"
              placeholder="Enter monthly income"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={calculateBudget}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Calculate
            </Button>
          </div>
        </div>

        {budget && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-foreground">Savings (20%)</h4>
              </div>
              <p className="text-2xl font-bold text-primary">${budget.savings}</p>
              <p className="text-xs text-muted-foreground mt-1">Emergency fund & investments</p>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-foreground">Necessities (50%)</h4>
              </div>
              <p className="text-2xl font-bold text-primary">${budget.necessities}</p>
              <p className="text-xs text-muted-foreground mt-1">Rent, food, utilities, insurance</p>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-foreground">Wants (30%)</h4>
              </div>
              <p className="text-2xl font-bold text-primary">${budget.wants}</p>
              <p className="text-xs text-muted-foreground mt-1">Entertainment, dining, shopping</p>
            </Card>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">Key Financial Principles for Athletes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Pay yourself first (automate savings)</div>
              <div>• Build a 6-month emergency fund</div>
              <div>• Avoid lifestyle inflation</div>
              <div>• Invest in your education</div>
              <div>• Diversify income streams</div>
              <div>• Work with financial advisors</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialLiteracy;
