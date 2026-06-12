import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceSearchBar } from "./WorkspaceSearchBar";
import { AIAssistantFAB } from "./AIAssistantFAB";
import { BottomBar } from "./BottomBar";
import { StocksSidebar } from "./StocksSidebar";
import { RainfallBackground, CoastalBackground, SnowfallBackground } from "./ThemeBackgrounds";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

const WorkspaceLayout = () => {
  const [theme, setTheme] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setTheme(localStorage.getItem("zyquence-theme") || "dark");
    check();
    window.addEventListener("storage", check);
    // Poll for theme changes from same tab
    const interval = setInterval(check, 500);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, []);

  return (
    <SidebarProvider>
      {theme === "rainfall" && <RainfallBackground />}
      {theme === "coastal" && <CoastalBackground />}
      {theme === "snowfall" && <SnowfallBackground />}
      <div className="min-h-screen flex w-full relative z-10">
        <WorkspaceSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          <div className="flex items-center md:hidden px-4 pt-3 pb-1">
            <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/70">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </div>
          <WorkspaceSearchBar />
          <div className="flex-1 overflow-y-auto p-6 pb-16 min-h-0">
            <Outlet />
          </div>
          <BottomBar />
        </main>
        <StocksSidebar />
        <AIAssistantFAB />
      </div>
    </SidebarProvider>
  );
};

export default WorkspaceLayout;
