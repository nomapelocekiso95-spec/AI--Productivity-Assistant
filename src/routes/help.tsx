import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Mail, NotebookPen } from "lucide-react";

import { PageHeader } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Guides — Aurea" },
      {
        name: "description",
        content: "Learn how to get the best results from Aurea's email, meeting and planning AI tools.",
      },
      { property: "og:title", content: "Help & Guides — Aurea" },
      { property: "og:description", content: "Guides and answers for Aurea's AI productivity tools." },
    ],
  }),
  component: HelpPage,
});

const guides = [
  {
    title: "Smart Email Generator",
    icon: Mail,
    to: "/email-generator" as const,
    body: "Say what you want to achieve in one line, pick a tone and length, then edit the draft before sending.",
  },
  {
    title: "Meeting Notes Summarizer",
    icon: NotebookPen,
    to: "/meeting-summarizer" as const,
    body: "Paste or upload raw notes. You get a summary, key points, decisions, owned action items and deadlines.",
  },
  {
    title: "AI Task Planner",
    icon: CalendarClock,
    to: "/task-planner" as const,
    body: "Add tasks with a duration and priority. Aurea sequences them into a realistic day or week with breaks.",
  },
];

const faqs = [
  {
    q: "How accurate is the AI output?",
    a: "It's a strong first draft, not a final answer. Always review names, numbers, commitments and dates before acting on them.",
  },
  {
    q: "Can I edit anything the AI produces?",
    a: "Yes. Emails, summaries, action items and schedule tasks are all editable, and you can regenerate at any time.",
  },
  {
    q: "What makes a good input?",
    a: "Specifics. Who it's for, what outcome you want, and any constraints such as deadlines or word limits.",
  },
  {
    q: "Is my content used to train models?",
    a: "No, unless you explicitly opt in under Settings → Data & privacy. It is off by default.",
  },
  {
    q: "How does the planner decide the order?",
    a: "It sorts by priority first, then by nearest deadline, fits tasks inside working hours, and inserts breaks and lunch so the plan stays realistic.",
  },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Help & guides"
        description="Everything you need to get great results from Aurea's AI tools."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {guides.map((g) => (
          <Card key={g.title} className="card-lift shadow-soft">
            <CardHeader>
              <span className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <g.icon className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle className="text-base">{g.title}</CardTitle>
              <CardDescription>{g.body}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={g.to}>
                  Open tool <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <AiDisclaimer className="mt-6" />
    </div>
  );
}
