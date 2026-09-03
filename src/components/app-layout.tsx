import { Link, useRouterState, type ReactNode } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";

import { AppSidebar, navItems, secondaryItems } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";

const allItems = [...navItems, ...secondaryItems];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const current = allItems.find((i) => i.url === pathname);
  const { theme, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-5" />
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex min-w-0 items-center gap-1.5 text-sm">
                <li className="shrink-0">
                  <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                    Aurea
                  </Link>
                </li>
                <li aria-hidden className="text-muted-foreground/50">/</li>
                <li className="min-w-0 truncate font-medium">{current?.title ?? "Dashboard"}</li>
              </ol>
            </nav>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <p className="mx-auto max-w-5xl">
              Aurea uses AI to assist your work. AI-generated content may contain mistakes or
              omissions — review important information before sending emails, making decisions, or
              acting on deadlines.
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
