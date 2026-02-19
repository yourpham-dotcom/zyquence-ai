import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import SpotifyCallback from "./pages/SpotifyCallback";
import MissionStatement from "./pages/MissionStatement";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Workspace layout & pages
import WorkspaceLayout from "./components/workspace/WorkspaceLayout";
import WorkspaceDashboard from "./pages/workspace/WorkspaceDashboard";
import CalendarPage from "./pages/workspace/CalendarPage";
import FinancePage from "./pages/workspace/FinancePage";
import WorkspacePage from "./pages/workspace/WorkspacePage";
import GoalsPage from "./pages/workspace/GoalsPage";
import AssistantPage from "./pages/workspace/AssistantPage";
import SettingsPage from "./pages/workspace/SettingsPage";
import TradingJournal from "./pages/workspace/TradingJournal";

// Existing pages
import Studio from "./pages/Studio";
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
import FreeDashboard from "./pages/FreeDashboard";
import ProDashboard from "./pages/ProDashboard";
import ArtistIntelligence from "./pages/ArtistIntelligence";
import MusicIntelligence from "./pages/MusicIntelligence";
import ConnectLayout from "./pages/community/ConnectLayout";
import CodeStudio from "./pages/CodeStudio";

// Student Hub
import StudentHubLayout from "./pages/student-hub/StudentHubLayout";
import StudentDashboard from "./pages/student-hub/StudentDashboard";
import AssignmentPlanner from "./pages/student-hub/AssignmentPlanner";
import StudyAssistant from "./pages/student-hub/StudyAssistant";
import CareerExplorer from "./pages/student-hub/CareerExplorer";
import ResumeBuilder from "./pages/student-hub/ResumeBuilder";
import AcademicBlueprint from "./pages/student-hub/AcademicBlueprint";

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/spotify-callback" element={<SpotifyCallback />} />
          <Route path="/mission" element={<MissionStatement />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Workspace layout with sidebar */}
          <Route path="/dashboard" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceDashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="trading" element={<TradingJournal />} />
          </Route>

          {/* Legacy dashboards (redirect to new workspace) */}
          <Route path="/pro-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/free-dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Existing tool routes */}
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
          <Route path="/artist-intelligence" element={<ArtistIntelligence />} />
          <Route path="/music-intelligence" element={<MusicIntelligence />} />
          <Route path="/code-studio" element={<CodeStudio />} />
          <Route path="/connect" element={<ConnectLayout />} />

          {/* Student Hub */}
          <Route path="/student-hub" element={<StudentHubLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="assignments" element={<AssignmentPlanner />} />
            <Route path="study" element={<StudyAssistant />} />
            <Route path="career" element={<CareerExplorer />} />
            <Route path="resume" element={<ResumeBuilder />} />
            <Route path="blueprint" element={<AcademicBlueprint />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
