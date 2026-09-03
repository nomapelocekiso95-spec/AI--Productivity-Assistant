import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  CircleHelp,
  LayoutDashboard,
  Mail,
  Moon,
  NotebookPen,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, blurb: "Your productivity overview" },
  { title: "Smart Email Generator", url: "/email-generator", icon: Mail, blurb: "Draft the right email in seconds" },
  { title: "Meeting Notes Summarizer", url: "/meeting-summarizer", icon: NotebookPen, blurb: "Turn raw notes into actions" },
  { title: "AI Task Planner", url: "/task-planner", icon: CalendarClock, blurb: "Organize your day automatically" },
] as const;

export const secondaryItems = [
  { title: "Settings", url: "/settings", icon: Settings, blurb: "Profile, appearance and AI preferences" },
  { title: "Help", url: "/help", icon: CircleHelp, blurb: "Guides and answers" },
] as const;

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();

  const renderItem = (item: { title: string; url: string; icon: typeof Mail }) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
        <Link to={item.url} onClick={() => setOpenMobile(false)} className="gap-3">
          <item.icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="gradient-primary grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-soft">
            <Sparkles className="h-4.5 w-4.5" aria-hidden />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-[15px] font-bold">Aurea</span>
              <span className="block truncate text-[11px] text-muted-foreground">AI productivity suite</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{navItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{secondaryItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            NM
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Nomapelo M.</p>
              <p className="truncate text-xs text-muted-foreground">Pro plan</p>
            </div>
          )}
        </div>
        <div className={collapsed ? "flex flex-col gap-1" : "flex items-center gap-1"}>
          <Button variant="ghost" size="icon" asChild aria-label="Open settings">
            <Link to="/settings" onClick={() => setOpenMobile(false)}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
