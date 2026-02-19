import { Outlet } from "react-router-dom";
import { StudentHubSidebar } from "@/components/student-hub/StudentHubSidebar";

export default function StudentHubLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <StudentHubSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
