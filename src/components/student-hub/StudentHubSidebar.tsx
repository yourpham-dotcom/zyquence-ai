import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Compass,
  FileText,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/student-hub", icon: LayoutDashboard, end: true },
  { title: "Assignments", path: "/student-hub/assignments", icon: BookOpen },
  { title: "Study Assistant", path: "/student-hub/study", icon: Brain },
  { title: "Career Explorer", path: "/student-hub/career", icon: Compass },
  { title: "Resume Builder", path: "/student-hub/resume", icon: FileText },
];

export function StudentHubSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-60 border-r border-border bg-sidebar flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">
              Student Hub
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
