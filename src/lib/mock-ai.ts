/**
 * Mock AI layer.
 *
 * Every function here returns a Promise and simulates latency so the UI can be
 * wired to a real provider later by swapping these implementations for server
 * function calls (same signatures, same return shapes).
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Tone = "formal" | "friendly" | "professional" | "persuasive" | "concise";
export type Length = "short" | "medium" | "detailed";

export interface EmailRequest {
  intent: string;
  recipient: string;
  subject?: string;
  category: string;
  tone: Tone;
  length: Length;
}

export interface EmailResult {
  subject: string;
  body: string;
}

const openers: Record<Tone, string> = {
  formal: "Dear",
  friendly: "Hi",
  professional: "Hello",
  persuasive: "Hi",
  concise: "Hi",
};

const closers: Record<Tone, string> = {
  formal: "Yours sincerely,",
  friendly: "Thanks so much,",
  professional: "Best regards,",
  persuasive: "Looking forward to your thoughts,",
  concise: "Thanks,",
};

export async function generateEmail(req: EmailRequest): Promise<EmailResult> {
  await delay(1400);
  if (Math.random() < 0.04) throw new Error("The AI service timed out. Please try again.");

  const name = req.recipient.split("@")[0]?.replace(/[._-]/g, " ") || "there";
  const subject =
    req.subject?.trim() ||
    `${req.category}: ${req.intent.trim().slice(0, 48)}${req.intent.length > 48 ? "…" : ""}`;

  const core = req.intent.trim().replace(/\s+/g, " ");
  const middle: Record<Length, string[]> = {
    short: [`${core}.`],
    medium: [
      `${core}.`,
      `I wanted to reach out directly so we can keep things moving without unnecessary back and forth.`,
    ],
    detailed: [
      `${core}.`,
      `I wanted to reach out directly so we can keep things moving without unnecessary back and forth.`,
      `To give a little more context: this is a priority for the team this week, and having your input early would help us avoid rework later. I'm happy to jump on a short call if that is easier than email.`,
      `If there is anything you need from my side to move forward, just let me know and I will get it over to you the same day.`,
    ],
  };

  const nudge =
    req.tone === "persuasive"
      ? "Given the timing, acting on this now would give us a real advantage — I'd love to get your go-ahead."
      : req.tone === "concise"
        ? "Could you confirm by end of day?"
        : "Please let me know if that works for you.";

  const body = [
    `${openers[req.tone]} ${capitalize(name)},`,
    "",
    ...middle[req.length].flatMap((p) => [p, ""]),
    nudge,
    "",
    closers[req.tone],
    "Nomapelo",
  ].join("\n");

  return { subject, body };
}

export type Priority = "high" | "medium" | "low";
export type Status = "not-started" | "in-progress" | "done";

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: Priority;
  status: Status;
  deadline: string;
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  deadlines: { label: string; date: string }[];
}

export interface MeetingRequest {
  title: string;
  date?: string;
  participants?: string;
  notes: string;
}

export async function summarizeMeeting(req: MeetingRequest): Promise<MeetingSummary> {
  await delay(1600);
  if (Math.random() < 0.04) throw new Error("Could not reach the summarization service.");

  const people = (req.participants || "Alex, Priya, Sam")
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const sentences = req.notes
    .split(/[\n.;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const pick = (i: number, fallback: string) => sentences[i] ?? fallback;
  const day = (offset: number) => {
    const d = new Date(req.date ? `${req.date}T09:00:00` : Date.now());
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  return {
    summary: `${req.title || "The meeting"} covered ${sentences.length || 3} main discussion threads with ${people.length} participants. The group aligned on near-term priorities, resolved the open questions blocking delivery, and assigned clear ownership for the follow-up work.`,
    keyPoints: [
      pick(0, "Current progress was reviewed against the agreed milestones."),
      pick(1, "Two risks were raised around timeline and resourcing."),
      pick(2, "Stakeholder feedback from last week was discussed in detail."),
      pick(3, "The team agreed on a lighter-weight review process going forward."),
    ],
    decisions: [
      pick(4, "Proceed with the current scope and revisit stretch items next sprint."),
      pick(5, "Weekly written status update replaces the mid-week sync."),
    ],
    actionItems: [
      {
        id: "a1",
        task: pick(6, "Draft the updated project plan and circulate for review"),
        owner: people[0] ?? "Alex",
        priority: "high",
        status: "not-started",
        deadline: day(2),
      },
      {
        id: "a2",
        task: pick(7, "Collect final feedback from stakeholders"),
        owner: people[1] ?? "Priya",
        priority: "medium",
        status: "in-progress",
        deadline: day(5),
      },
      {
        id: "a3",
        task: pick(8, "Update the shared documentation and changelog"),
        owner: people[2] ?? "Sam",
        priority: "low",
        status: "not-started",
        deadline: day(9),
      },
    ],
    deadlines: [
      { label: "Updated project plan circulated", date: day(2) },
      { label: "Stakeholder feedback consolidated", date: day(5) },
      { label: "Milestone review", date: day(12) },
    ],
  };
}

export interface PlannerTask {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  priority: Priority;
  deadline?: string;
  preferredTime?: string;
  category?: string;
  done?: boolean;
}

export interface ScheduleBlock {
  id: string;
  start: string;
  end: string;
  title: string;
  emoji: string;
  kind: "task" | "break";
  priority?: Priority;
  taskId?: string;
}

export interface DaySchedule {
  day: string;
  blocks: ScheduleBlock[];
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const emojiFor = (t: PlannerTask) => {
  const n = `${t.name} ${t.category ?? ""}`.toLowerCase();
  if (n.includes("email") || n.includes("inbox")) return "📧";
  if (n.includes("report") || n.includes("write") || n.includes("doc")) return "📝";
  if (n.includes("meet") || n.includes("call") || n.includes("sync")) return "📞";
  if (n.includes("review")) return "🔍";
  if (n.includes("plan")) return "🗺️";
  return "🎯";
};

const fmt = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

export async function generateSchedule(
  tasks: PlannerTask[],
  view: "daily" | "weekly",
): Promise<DaySchedule[]> {
  await delay(1500);
  if (!tasks.length) return [];

  const sorted = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => {
      const p = priorityRank[a.priority] - priorityRank[b.priority];
      if (p !== 0) return p;
      return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
    });

  const dayNames =
    view === "daily"
      ? ["Today"]
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const days: DaySchedule[] = dayNames.map((day) => ({ day, blocks: [] }));
  const cursors = dayNames.map(() => 8 * 60 + 30);
  const DAY_END = 17 * 60;

  let d = 0;
  let sinceBreak = 0;
  for (const task of sorted) {
    // Find a day with room; never schedule past the working day.
    let attempts = 0;
    while ((cursors[d] ?? DAY_END) + task.duration > DAY_END && attempts < days.length) {
      d = (d + 1) % days.length;
      attempts++;
      sinceBreak = 0;
    }
    const current = days[d];
    let cursor = cursors[d];
    if (!current || cursor === undefined) continue;
    if (cursor + task.duration > DAY_END) continue;

    if (sinceBreak >= 120) {
      current.blocks.push({
        id: `br-${d}-${cursor}`,
        start: fmt(cursor),
        end: fmt(cursor + 15),
        title: "Break — step away from the screen",
        emoji: "☕",
        kind: "break",
      });
      cursor += 15;
      sinceBreak = 0;
    }

    if (cursor < 12 * 60 && cursor + task.duration > 12 * 60) {
      current.blocks.push({
        id: `lu-${d}`,
        start: fmt(12 * 60),
        end: fmt(12 * 60 + 45),
        title: "Lunch",
        emoji: "🍽️",
        kind: "break",
      });
      cursor = 12 * 60 + 45;
      sinceBreak = 0;
    }

    current.blocks.push({
      id: `t-${task.id}`,
      start: fmt(cursor),
      end: fmt(cursor + task.duration),
      title: task.name,
      emoji: emojiFor(task),
      kind: "task",
      priority: task.priority,
      taskId: task.id,
    });
    cursors[d] = cursor + task.duration;
    sinceBreak += task.duration;
    if (view === "weekly") d = (d + 1) % days.length;
  }

  return days.filter((day) => day.blocks.length > 0);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
