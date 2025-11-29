import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import Auth from "./pages/Auth";
import DataIntelligence from "./pages/DataIntelligence";
import DataUpload from "./pages/DataUpload";
import GamingIntelligence from "./pages/GamingIntelligence";
import MentalWellness from "./pages/gaming/MentalWellness";
import CodePractice from "./pages/gaming/CodePractice";
import ArtistCareer from "./pages/gaming/ArtistCareer";
import FoodIntelligence from "./pages/gaming/FoodIntelligence";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/data-intelligence" element={<DataIntelligence />} />
          <Route path="/data-intelligence/upload" element={<DataUpload />} />
          <Route path="/data-intelligence/sql-lab" element={<SQLLab />} />
          <Route path="/data-intelligence/visualizer" element={<Visualizer />} />
          <Route path="/data-intelligence/experiments" element={<Experiments />} />
          <Route path="/data-intelligence/missions" element={<Missions />} />
          <Route path="/data-intelligence/portfolio" element={<Portfolio />} />
          <Route path="/gaming-intelligence" element={<GamingIntelligence />} />
          <Route path="/gaming-intelligence/mental-wellness" element={<MentalWellness />} />
          <Route path="/gaming-intelligence/code-practice" element={<CodePractice />} />
          <Route path="/gaming-intelligence/artist-career" element={<ArtistCareer />} />
          <Route path="/gaming-intelligence/food-intelligence" element={<FoodIntelligence />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
