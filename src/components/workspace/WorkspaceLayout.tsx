import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceSearchBar } from "./WorkspaceSearchBar";
import { AIAssistantFAB } from "./AIAssistantFAB";
import { BottomBar } from "./BottomBar";
import { StocksSidebar } from "./StocksSidebar";
import { Outlet } from "react-router-dom";

const WorkspaceLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WorkspaceSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
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
