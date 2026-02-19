import { useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FolderKanban,
  DollarSign,
  Target,
  Palette,
  Globe,
  Database,
  Gamepad2,
  Cpu,
  Music,
  Settings,
  User,
  LogOut,
  Lock,
  Crown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Megaphone,
  MessageCircle,
  LineChart,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useFocusAreas } from "@/hooks/useFocusAreas";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MiniCalendar } from "./MiniCalendar";
import { SidebarMiniGames } from "./SidebarMiniGames";
import { SidebarSpotify } from "./SidebarSpotify";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, alwaysShow: true },
  { title: "Chat", path: "/dashboard/assistant", icon: Sparkles, alwaysShow: true },
  { title: "Calendar", path: "/dashboard/calendar", icon: CalendarDays, alwaysShow: false },
  { title: "Workspace", path: "/dashboard/workspace", icon: FolderKanban, alwaysShow: true },
  { title: "Finance", path: "/dashboard/finance", icon: DollarSign, alwaysShow: false },
  { title: "Goals", path: "/dashboard/goals", icon: Target, alwaysShow: false },
];

const tradingNav = [
  { title: "Trading Journal", path: "/dashboard/trading", icon: LineChart },
];

const toolsNav = [
  { title: "Studio", path: "/studio", icon: Palette },
  { title: "Zyquence Atlas", path: "/studio", icon: Globe },
];

const socialNav = [
  { title: "Community", path: "/connect", icon: Share2 },
  { title: "Social Media", path: "/dashboard/social", icon: Megaphone },
  { title: "Public Relations", path: "/dashboard/pr", icon: MessageCircle },
];

const proNav = [
  { title: "Data Intelligence", path: "/data-intelligence", icon: Database },
  { title: "Gaming Engine", path: "/gaming-intelligence", icon: Gamepad2 },
  { title: "AI Builder", path: "/ai-builder", icon: Cpu },
  { title: "Artist Intelligence", path: "/artist-intelligence", icon: Music },
];

export function WorkspaceSidebar() {
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();
  const { getVisibleTools } = useFocusAreas();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const visibleTools = getVisibleTools();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo & User */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Zyquence
              </span>
            )}
            <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground" />
          </div>

          {!collapsed && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {isPro ? (
                  <Crown className="h-3.5 w-3.5 text-yellow-500" />
                ) : null}
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  isPro ? "text-yellow-500" : "text-sidebar-foreground/50"
                )}>
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav
                .filter((item) => item.alwaysShow || !visibleTools || visibleTools.has(item.title))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/dashboard"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4 bg-sidebar-border" />

        {/* Trading */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4 bg-sidebar-border" />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav
                .filter((item) => !visibleTools || visibleTools.has(item.title))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4 bg-sidebar-border" />

        {/* Social & PR */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialNav
                .filter((item) => !visibleTools || visibleTools.has(item.title))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {proNav
                .filter((item) => !visibleTools || visibleTools.has(item.title))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    {isPro ? (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    ) : (
                      <button
                        onClick={() => navigate("/pricing")}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors w-full"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            <Lock className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mini Calendar */}
        {!collapsed && (
          <>
            <Separator className="mx-4 bg-sidebar-border" />
            <div className="px-3 py-2">
              <MiniCalendar />
            </div>
            <Separator className="mx-4 bg-sidebar-border" />
            <SidebarSpotify />
            <Separator className="mx-4 bg-sidebar-border" />
            <SidebarMiniGames />
          </>
        )}

        {/* Bottom */}
        <div className="mt-auto">
          <Separator className="bg-sidebar-border" />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <NavLink
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <Settings className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Profile">
                    <NavLink
                      to="/dashboard/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Profile</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Sign Out">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-destructive transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Sign Out</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
