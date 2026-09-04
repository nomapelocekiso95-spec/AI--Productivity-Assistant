import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Mail, Pencil, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/app-layout";
import { AiBadge, AiDisclaimer } from "@/components/ai-disclaimer";
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
import { generateEmail, type EmailResult, type Length, type Tone } from "@/lib/mock-ai";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aurea" },
      {
        name: "description",
        content:
          "Describe what you want to say and generate a polished email in the tone and length you need.",
      },
      { property: "og:title", content: "Smart Email Generator — Aurea" },
      {
        property: "og:description",
        content: "Generate polished, on-tone emails from a one-line intent.",
      },
    ],
  }),
  component: EmailGeneratorPage,
});

const schema = z.object({
  intent: z
    .string()
    .trim()
    .min(10, { message: "Tell us a little more — at least 10 characters." })
    .max(1000, { message: "Keep this under 1000 characters." }),
  recipient: z
    .string()
    .trim()
    .min(1, { message: "Add a recipient name or email." })
    .max(120),
  subject: z.string().trim().max(150).optional(),
});

const tones: { value: Tone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "persuasive", label: "Persuasive" },
  { value: "concise", label: "Concise" },
];

const categories = [
  "Follow-up",
  "Introduction",
  "Request",
  "Apology",
  "Thank you",
  "Announcement",
  "Sales outreach",
];

function EmailGeneratorPage() {
  const [intent, setIntent] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Follow-up");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");

  const [errors, setErrors] = useState<{ intent?: string; recipient?: string; subject?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [editing, setEditing] = useState(false);

  async function run() {
    const parsed = schema.safeParse({ intent, recipient, subject });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setError(null);
    setLoading(true);
    setEditing(false);
    try {
      const res = await generateEmail({ intent, recipient, subject, category, tone, length });
      setResult(res);
      toast.success("Email drafted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    toast.success("Email copied to clipboard");
  }

  function clearAll() {
    setResult(null);
    setError(null);
    setEditing(false);
    setIntent("");
    setRecipient("");
    setSubject("");
    toast("Cleared", { description: "Your draft and inputs were reset." });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Smart Email Generator"
        description="Describe what you want to say — Aurea writes it in the tone and length you choose."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Your input</CardTitle>
            <CardDescription>The more context you give, the better the draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="intent">What do you want to say?</Label>
              <Textarea
                id="intent"
                rows={5}
                value={intent}
                maxLength={1000}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g. Ask Priya for the final budget numbers before Friday's board review"
                aria-invalid={!!errors.intent}
                aria-describedby={errors.intent ? "intent-error" : undefined}
              />
              {errors.intent && (
                <p id="intent-error" className="text-xs text-destructive">
                  {errors.intent}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  maxLength={120}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="priya@company.com"
                  aria-invalid={!!errors.recipient}
                />
                {errors.recipient && <p className="text-xs text-destructive">{errors.recipient}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  value={subject}
                  maxLength={150}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Leave blank and AI will suggest one"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Purpose</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="length">Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                  <SelectTrigger id="length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={run} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Generate Email
                </>
              )}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base">Generated email</CardTitle>
              <CardDescription>Review and edit before sending.</CardDescription>
            </div>
            {result && !loading && <AiBadge />}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="space-y-3" aria-live="polite" aria-busy="true">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
                <p className="text-xs text-muted-foreground">Generating your draft…</p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={run}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden /> Retry
                </Button>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <Mail className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">No draft yet</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                  Fill in what you want to say and press Generate Email — your draft appears here.
                </p>
              </div>
            )}

            {!loading && result && (
              <>
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
                  {editing ? (
                    <Input
                      className="mt-1"
                      value={result.subject}
                      onChange={(e) => setResult({ ...result, subject: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 font-medium">{result.subject}</p>
                  )}
                  <div className="my-3 h-px bg-border" />
                  {editing ? (
                    <Textarea
                      rows={14}
                      value={result.body}
                      onChange={(e) => setResult({ ...result, body: e.target.value })}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.body}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={copy}>
                    <Copy className="mr-2 h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={run}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden /> Regenerate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" aria-hidden />
                    {editing ? "Done editing" : "Edit"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAll}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden /> Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
