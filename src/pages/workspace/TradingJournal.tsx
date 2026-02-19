import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingJournalList } from "@/components/trading/TradingJournalList";
import { TradingEntryForm } from "@/components/trading/TradingEntryForm";
import { TradingAnalytics } from "@/components/trading/TradingAnalytics";
import { TradingAIInsights } from "@/components/trading/TradingAIInsights";

export default function TradingJournal() {
  const [tab, setTab] = useState("journal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trading Journal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Log trades, analyze performance, and improve with AI insights.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="new">New Trade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-4">
          <TradingJournalList />
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <TradingEntryForm onSuccess={() => setTab("journal")} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <TradingAnalytics />
        </TabsContent>
        <TabsContent value="ai" className="mt-4">
          <TradingAIInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
