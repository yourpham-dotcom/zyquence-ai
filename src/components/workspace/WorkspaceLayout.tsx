import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceSearchBar } from "./WorkspaceSearchBar";
import { AIAssistantFAB } from "./AIAssistantFAB";
import { Outlet } from "react-router-dom";

const WorkspaceLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WorkspaceSidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <WorkspaceSearchBar />
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
        <AIAssistantFAB />
      </div>
    </SidebarProvider>
  );
};

export default WorkspaceLayout;
