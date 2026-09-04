import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Copy,
  Download,
  Loader2,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/app-layout";
import { AiBadge, AiDisclaimer } from "@/components/ai-disclaimer";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  summarizeMeeting,
  type ActionItem,
  type MeetingSummary,
  type Priority,
  type Status,
} from "@/lib/mock-ai";

export const Route = createFileRoute("/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Aurea" },
      {
        name: "description",
        content:
          "Paste raw meeting notes and get a summary, key points, decisions, owned action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Aurea" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into decisions, owners and deadlines.",
      },
    ],
  }),
  component: MeetingSummarizerPage,
});

const schema = z.object({
  title: z.string().trim().min(2, { message: "Add a meeting title." }).max(140),
  notes: z
    .string()
    .trim()
    .min(40, { message: "Paste at least a few lines of notes (40+ characters)." })
    .max(20000),
});

function MeetingSummarizerPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ title?: string; notes?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run() {
    const parsed = schema.safeParse({ title, notes });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next as typeof errors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setError(null);
    setLoading(true);
    try {
      setResult(await summarizeMeeting({ title, date, participants, notes }));
      toast.success("Meeting summarized");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      toast.error("File too large", { description: "Please upload a text file under 500 KB." });
      return;
    }
    setNotes(await file.text());
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    toast.success("Notes loaded from file");
  }

  function asText(r: MeetingSummary) {
    return [
      `${title || "Meeting"}${date ? ` — ${date}` : ""}`,
      "",
      "SUMMARY",
      r.summary,
      "",
      "KEY POINTS",
      ...r.keyPoints.map((p) => `- ${p}`),
      "",
      "DECISIONS",
      ...r.decisions.map((p) => `- ${p}`),
      "",
      "ACTION ITEMS",
      ...r.actionItems.map((a) => `- ${a.task} | ${a.owner} | ${a.priority} | ${a.status} | ${a.deadline}`),
      "",
      "DEADLINES",
      ...r.deadlines.map((d) => `- ${d.date}: ${d.label}`),
    ].join("\n");
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(asText(result));
    toast.success("Summary copied to clipboard");
  }

  function exportNotes() {
    if (!result) return;
    const blob = new Blob([asText(result)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "meeting").replace(/\s+/g, "-").toLowerCase()}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported");
  }

  function updateItem(id: string, patch: Partial<ActionItem>) {
    if (!result) return;
    setResult({
      ...result,
      actionItems: result.actionItems.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Paste or upload your notes — Aurea extracts the summary, decisions, owners and deadlines."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="shadow-soft lg:sticky lg:top-20 lg:self-start">
          <CardHeader>
            <CardTitle className="text-base">Meeting details</CardTitle>
            <CardDescription>Title and notes are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Meeting title</Label>
              <Input
                id="title"
                value={title}
                maxLength={140}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 planning review"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date (optional)</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="participants">Participants (optional)</Label>
                <Input
                  id="participants"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="Alex, Priya, Sam"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <Label htmlFor="notes">Meeting notes</Label>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-3.5 w-3.5" aria-hidden /> Upload .txt
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md,text/plain"
                  className="hidden"
                  onChange={onFile}
                />
              </div>
              <Textarea
                id="notes"
                rows={12}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your raw notes here — bullet points, transcript fragments, anything."
                aria-invalid={!!errors.notes}
              />
              {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
            </div>
            <Button onClick={run} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Summarizing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Summarize Meeting
                </>
              )}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading && (
            <Card className="shadow-soft" aria-live="polite" aria-busy="true">
              <CardHeader>
                <CardTitle className="text-base">Working through your notes…</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="border-destructive/30 shadow-soft">
              <CardContent className="pt-6 text-sm">
                <p className="font-medium text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={run}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden /> Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && !result && (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-16 text-center">
                <NotebookPen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">Nothing summarized yet</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                  Add your meeting notes on the left. Your summary, decisions, action items and
                  deadlines will appear here.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && result && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <AiBadge />
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button size="sm" onClick={copy}>
                    <Copy className="mr-2 h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportNotes}>
                    <Download className="mr-2 h-3.5 w-3.5" aria-hidden /> Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={run}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden /> Regenerate
                  </Button>
                </div>
              </div>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">{result.summary}</CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-base">Key points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.keyPoints.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-base">Decisions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.decisions.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Action items</CardTitle>
                  <CardDescription>Owners, priority and status are editable.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">Task</th>
                          <th className="py-2 pr-3 font-medium">Owner</th>
                          <th className="py-2 pr-3 font-medium">Priority</th>
                          <th className="py-2 pr-3 font-medium">Status</th>
                          <th className="py-2 font-medium">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.actionItems.map((a) => (
                          <tr key={a.id} className="border-b border-border/60 last:border-0">
                            <td className="py-3 pr-3">
                              <Input
                                value={a.task}
                                aria-label="Task"
                                onChange={(e) => updateItem(a.id, { task: e.target.value })}
                                className="h-8 border-transparent bg-transparent px-1 hover:border-input focus-visible:border-input"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Input
                                value={a.owner}
                                aria-label="Owner"
                                onChange={(e) => updateItem(a.id, { owner: e.target.value })}
                                className="h-8 w-28 border-transparent bg-transparent px-1 hover:border-input focus-visible:border-input"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Select
                                value={a.priority}
                                onValueChange={(v) => updateItem(a.id, { priority: v as Priority })}
                              >
                                <SelectTrigger className="h-8 w-[110px]" aria-label="Priority">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 pr-3">
                              <Select
                                value={a.status}
                                onValueChange={(v) => updateItem(a.id, { status: v as Status })}
                              >
                                <SelectTrigger className="h-8 w-[135px]" aria-label="Status">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-started">Not started</SelectItem>
                                  <SelectItem value="in-progress">In progress</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3">
                              <Input
                                type="date"
                                aria-label="Deadline"
                                value={a.deadline}
                                onChange={(e) => updateItem(a.id, { deadline: e.target.value })}
                                className="h-8 w-[150px]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {result.actionItems.map((a) => (
                      <div key={a.id} className="rounded-xl border border-border p-3">
                        <p className="text-sm font-medium">{a.task}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {a.owner} · due {a.deadline}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <PriorityBadge priority={a.priority} />
                          <StatusBadge status={a.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base">Deadlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.deadlines.map((d) => (
                    <div
                      key={d.label}
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0">
                        <span className="font-medium">{d.date}</span>
                        <span className="text-muted-foreground"> — {d.label}</span>
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AiDisclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
