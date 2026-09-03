import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/mock-ai";

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive ring-destructive/20",
  medium: "bg-warning/15 text-warning-foreground ring-warning/30 dark:text-warning",
  low: "bg-success/12 text-success ring-success/25",
};

const statusStyles: Record<Status, string> = {
  "not-started": "bg-muted text-muted-foreground ring-border",
  "in-progress": "bg-primary/10 text-primary ring-primary/20",
  done: "bg-success/12 text-success ring-success/25",
};

const statusLabels: Record<Status, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, priorityStyles[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn(base, statusStyles[status])}>{statusLabels[status]}</span>;
}
