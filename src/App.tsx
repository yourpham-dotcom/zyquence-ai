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
import MiniGames from "./pages/gaming/MiniGames";
import CreativeSuperpower from "./pages/gaming/CreativeSuperpower";
import ConcertBuilder from "./pages/gaming/ConcertBuilder";
import SportsArena from "./pages/gaming/SportsArena";
import RealEstate from "./pages/gaming/RealEstate";
import CarBuilder from "./pages/gaming/CarBuilder";
import Journal from "./pages/gaming/Journal";
import ProjectManager from "./pages/gaming/ProjectManager";
import AIBuilderHub from "./pages/AIBuilderHub";
import SQLLab from "./pages/SQLLab";
import Visualizer from "./pages/Visualizer";
import Experiments from "./pages/Experiments";
import Missions from "./pages/Missions";
import Portfolio from "./pages/Portfolio";
import SpotifyCallback from "./pages/SpotifyCallback";
import Pricing from "./pages/Pricing";
import ProDashboard from "./pages/ProDashboard";
import FreeDashboard from "./pages/FreeDashboard";
import ArtistIntelligence from "./pages/ArtistIntelligence";
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
          <Route path="/gaming-intelligence/mini-games" element={<MiniGames />} />
          <Route path="/gaming-intelligence/creative-superpower" element={<CreativeSuperpower />} />
          <Route path="/gaming-intelligence/concert-builder" element={<ConcertBuilder />} />
          <Route path="/gaming-intelligence/sports-arena" element={<SportsArena />} />
          <Route path="/gaming-intelligence/real-estate" element={<RealEstate />} />
          <Route path="/gaming-intelligence/car-builder" element={<CarBuilder />} />
          <Route path="/gaming-intelligence/journal" element={<Journal />} />
          <Route path="/gaming-intelligence/projects" element={<ProjectManager />} />
          <Route path="/ai-builder" element={<AIBuilderHub />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pro-dashboard" element={<ProDashboard />} />
          <Route path="/free-dashboard" element={<FreeDashboard />} />
          <Route path="/spotify-callback" element={<SpotifyCallback />} />
          <Route path="/artist-intelligence" element={<ArtistIntelligence />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
