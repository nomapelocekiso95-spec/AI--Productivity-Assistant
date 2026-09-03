import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Mail,
  NotebookPen,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aurea AI Productivity Suite" },
      {
        name: "description",
        content:
          "Your Aurea dashboard: write emails, summarize meetings and plan your day with AI assistance.",
      },
      { property: "og:title", content: "Dashboard — Aurea AI Productivity Suite" },
      {
        property: "og:description",
        content: "Write emails, summarize meetings and plan your day with AI assistance.",
      },
    ],
  }),
  component: DashboardPage,
});

const quickActions = [
  {
    title: "Write an Email",
    description: "Describe what you want to say and get a polished draft in the right tone.",
    icon: Mail,
    to: "/email-generator" as const,
    cta: "Open generator",
  },
  {
    title: "Summarize Meeting",
    description: "Paste raw notes and get a summary, decisions and owned action items.",
    icon: NotebookPen,
    to: "/meeting-summarizer" as const,
    cta: "Summarize notes",
  },
  {
    title: "Plan My Day",
    description: "Drop in your tasks and let Aurea build a realistic, prioritized schedule.",
    icon: CalendarClock,
    to: "/task-planner" as const,
    cta: "Build schedule",
  },
];

const stats = [
  { label: "Emails Generated", value: "128", delta: "+12 this week", icon: Mail },
  { label: "Meetings Summarized", value: "34", delta: "+5 this week", icon: NotebookPen },
  { label: "Tasks Planned", value: "216", delta: "+28 this week", icon: CheckCircle2 },
];

const weekly = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 54 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 71 },
  { day: "Sat", value: 26 },
  { day: "Sun", value: 18 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`${greeting()}! Ready to get productive?`}
        description="Three AI tools that take the busywork out of your day — writing, summarizing and planning."
      />

      <section aria-labelledby="quick-actions" className="mb-8">
        <h2 id="quick-actions" className="mb-3 text-sm font-semibold text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Card key={a.title} className="card-lift shadow-soft">
              <CardHeader>
                <span className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <a.icon className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full sm:w-auto">
                  <Link to={a.to}>
                    {a.cta}
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="overview" className="mb-8">
        <h2 id="overview" className="mb-3 text-sm font-semibold text-muted-foreground">
          Productivity overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted-foreground">{s.label}</p>
                  <s.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  {s.delta}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-muted-foreground">Productivity Score</p>
                <Zap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-gradient">86</p>
              <Progress value={86} className="mt-3 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">9 points above your average</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="activity" className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle id="activity" className="text-base">
              This week's activity
            </CardTitle>
            <CardDescription>AI assists per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2 sm:gap-4">
              {weekly.map((d) => (
                <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="gradient-primary w-full rounded-t-md transition-all duration-500"
                    style={{ height: `${d.value}%` }}
                    role="img"
                    aria-label={`${d.day}: ${d.value} assists`}
                  />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Your last few AI assists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { t: "Follow-up email to the design team", s: "12 min ago", i: Mail },
              { t: "Q3 planning meeting summarized", s: "1 hour ago", i: NotebookPen },
              { t: "Thursday schedule generated", s: "Yesterday", i: CalendarClock },
            ].map((r) => (
              <div key={r.t} className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                  <r.i className="h-4 w-4 text-muted-foreground" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.t}</span>
                  <span className="block text-xs text-muted-foreground">{r.s}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <AiDisclaimer className="mt-8" />
    </div>
  );
}
