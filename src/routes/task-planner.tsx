import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/app-layout";
import { AiBadge, AiDisclaimer } from "@/components/ai-disclaimer";
import { PriorityBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  generateSchedule,
  type DaySchedule,
  type PlannerTask,
  type Priority,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aurea" },
      {
        name: "description",
        content:
          "Add your tasks and let Aurea build a realistic daily or weekly schedule with breaks and priorities.",
      },
      { property: "og:title", content: "AI Task Planner — Aurea" },
      {
        property: "og:description",
        content: "Turn a task list into a realistic, prioritized daily or weekly schedule.",
      },
    ],
  }),
  component: TaskPlannerPage,
});

const taskSchema = z.object({
  name: z.string().trim().min(3, { message: "Give the task a name (3+ characters)." }).max(120),
  duration: z
    .number({ message: "Enter a duration in minutes." })
    .min(5, { message: "Minimum 5 minutes." })
    .max(480, { message: "Keep tasks under 8 hours — split longer work up." }),
});

const emptyDraft = {
  name: "",
  description: "",
  duration: "60",
  priority: "medium" as Priority,
  deadline: "",
  preferredTime: "",
  category: "",
};

function TaskPlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([
    { id: "t1", name: "Review quarterly report", duration: 90, priority: "high", category: "Deep work" },
    { id: "t2", name: "Check and respond to emails", duration: 30, priority: "medium", category: "Admin" },
    { id: "t3", name: "Prepare project update deck", duration: 75, priority: "high", category: "Deep work" },
  ]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; duration?: string }>({});
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[] | null>(null);

  function saveTask() {
    const parsed = taskSchema.safeParse({ name: draft.name, duration: Number(draft.duration) });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next as typeof errors);
      return;
    }
    setErrors({});
    const description = draft.description.trim();
    const deadline = draft.deadline;
    const preferredTime = draft.preferredTime;
    const category = draft.category.trim();
    const task: PlannerTask = {
      id: editingId ?? `t${Date.now()}`,
      name: draft.name.trim(),
      duration: Number(draft.duration),
      priority: draft.priority,
      ...(description ? { description } : {}),
      ...(deadline ? { deadline } : {}),
      ...(preferredTime ? { preferredTime } : {}),
      ...(category ? { category } : {}),
    };
    setTasks((prev) => (editingId ? prev.map((t) => (t.id === editingId ? task : t)) : [...prev, task]));
    toast.success(editingId ? "Task updated" : "Task added");
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function editTask(t: PlannerTask) {
    setEditingId(t.id);
    setDraft({
      name: t.name,
      description: t.description ?? "",
      duration: String(t.duration),
      priority: t.priority,
      deadline: t.deadline ?? "",
      preferredTime: t.preferredTime ?? "",
      category: t.category ?? "",
    });
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Task deleted");
  }

  async function build(nextView = view) {
    if (!tasks.some((t) => !t.done)) {
      toast.error("Add at least one open task first");
      return;
    }
    setLoading(true);
    try {
      setSchedule(await generateSchedule(tasks, nextView));
      toast.success(`${nextView === "daily" ? "Daily" : "Weekly"} schedule generated`);
    } catch {
      toast.error("Could not generate the schedule. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Task Planner"
        description="Add what needs doing — Aurea sequences it into a realistic schedule with breaks."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">{editingId ? "Edit task" : "Add a task"}</CardTitle>
              <CardDescription>Duration and priority drive the schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Task name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Prepare project report"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Estimated duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    value={draft.duration}
                    onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                    aria-invalid={!!errors.duration}
                  />
                  {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={draft.priority}
                    onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={draft.deadline}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preferred">Preferred time (optional)</Label>
                  <Input
                    id="preferred"
                    type="time"
                    value={draft.preferredTime}
                    onChange={(e) => setDraft({ ...draft, preferredTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category (optional)</Label>
                <Input
                  id="category"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  placeholder="Deep work, Admin, Meetings…"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveTask}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  {editingId ? "Save changes" : "Add task"}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setDraft(emptyDraft);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Your tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No tasks yet — add one above to get started.
                </p>
              )}
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border p-3 transition-colors",
                    t.done && "opacity-60",
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn("truncate text-sm font-medium", t.done && "line-through")}>
                      {t.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <PriorityBadge priority={t.priority} />
                      <span>{t.duration} min</span>
                      {t.deadline && <span>· due {t.deadline}</span>}
                      {t.category && <span>· {t.category}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                      onClick={() =>
                        setTasks((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                        )
                      }
                    >
                      <Check className={cn("h-4 w-4", t.done && "text-success")} />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => editTask(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete task"
                      onClick={() => removeTask(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button onClick={() => build()} disabled={loading} size="lg" className="mt-2 w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Planning…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Generate My Schedule
                  </>
                )}
              </Button>
              <AiDisclaimer />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft lg:sticky lg:top-20 lg:self-start">
          <CardHeader className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base">Your schedule</CardTitle>
                <CardDescription>Prioritized, deadline-aware, with breaks built in.</CardDescription>
              </div>
              {schedule && !loading && <AiBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                value={view}
                onValueChange={(v) => {
                  const next = v as "daily" | "weekly";
                  setView(next);
                  if (schedule) build(next);
                }}
              >
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
              <Input
                type="date"
                aria-label="Schedule date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-[150px]"
              />
              {schedule && (
                <Button variant="outline" size="sm" onClick={() => build()} disabled={loading}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden /> Regenerate
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="space-y-3" aria-live="polite" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
                <p className="text-xs text-muted-foreground">Sequencing your tasks…</p>
              </div>
            )}

            {!loading && !schedule && (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">No schedule yet</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                  Add your tasks and press Generate My Schedule to see a realistic timeline.
                </p>
              </div>
            )}

            {!loading &&
              schedule?.map((day) => (
                <section key={day.day}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{day.day}</h3>
                  <ol className="space-y-2">
                    {day.blocks.map((b) => (
                      <li
                        key={b.id}
                        className={cn(
                          "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3 transition-colors",
                          b.kind === "break"
                            ? "border-dashed border-border bg-muted/40"
                            : "border-border bg-card",
                          b.priority === "high" && "border-primary/40 bg-accent/40",
                        )}
                      >
                        <span className="shrink-0 font-mono text-xs text-muted-foreground sm:text-sm">
                          {b.start}
                          <span className="hidden sm:inline"> – {b.end}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="flex min-w-0 items-center gap-2">
                            <span aria-hidden>{b.emoji}</span>
                            <span className="truncate text-sm font-medium">{b.title}</span>
                          </span>
                          {b.priority && (
                            <span className="mt-1 inline-block">
                              <PriorityBadge priority={b.priority} />
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
