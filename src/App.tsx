import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import DataIntelligence from "./pages/DataIntelligence";
import DataUpload from "./pages/DataUpload";
import SQLLab from "./pages/SQLLab";
import Visualizer from "./pages/Visualizer";
import Experiments from "./pages/Experiments";
import Missions from "./pages/Missions";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/data-intelligence" element={<DataIntelligence />} />
          <Route path="/data-intelligence/upload" element={<DataUpload />} />
          <Route path="/data-intelligence/sql-lab" element={<SQLLab />} />
          <Route path="/data-intelligence/visualizer" element={<Visualizer />} />
          <Route path="/data-intelligence/experiments" element={<Experiments />} />
          <Route path="/data-intelligence/missions" element={<Missions />} />
          <Route path="/data-intelligence/portfolio" element={<Portfolio />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
