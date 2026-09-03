import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Monitor, Moon, Sun } from "lucide-react";

import { PageHeader } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aurea" },
      {
        name: "description",
        content: "Manage your profile, appearance, notifications, AI preferences and privacy in Aurea.",
      },
      { property: "og:title", content: "Settings — Aurea" },
      { property: "og:description", content: "Profile, appearance, notifications and AI preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("Nomapelo M.");
  const [email, setEmail] = useState("nomapelo@company.com");
  const [role, setRole] = useState("Product Manager");
  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    deadlineAlerts: true,
    productNews: false,
    autoTone: true,
    saveHistory: true,
    trainingData: false,
  });

  const toggle = (k: keyof typeof prefs) => (v: boolean) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    toast.success("Preference saved");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Personalize Aurea and control how AI works for you." />

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear across the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Full name</Label>
              <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pemail">Email</Label>
              <Input id="pemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prole">Role</Label>
            <Input id="prole" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <Button onClick={() => toast.success("Profile updated")}>Save profile</Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how Aurea looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                aria-pressed={theme === opt.value}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  theme === opt.value
                    ? "border-primary bg-accent shadow-soft"
                    : "border-border hover:border-primary/40",
                )}
              >
                <opt.icon className="h-5 w-5" aria-hidden />
                <span>
                  <span className="block text-sm font-medium">{opt.label} mode</span>
                  <span className="block text-xs text-muted-foreground">
                    {opt.value === "light" ? "Bright and crisp" : "Easier on the eyes at night"}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" aria-hidden /> Your choice is remembered on this device.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { k: "weeklyDigest" as const, t: "Weekly productivity digest", d: "A Monday summary of your week." },
            { k: "deadlineAlerts" as const, t: "Deadline alerts", d: "Reminders before extracted deadlines." },
            { k: "productNews" as const, t: "Product news", d: "Occasional updates about new features." },
          ].map((row) => (
            <div key={row.k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <Label htmlFor={row.k} className="text-sm font-medium">
                  {row.t}
                </Label>
                <p className="text-xs text-muted-foreground">{row.d}</p>
              </div>
              <Switch id={row.k} checked={prefs[row.k]} onCheckedChange={toggle(row.k)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">AI preferences</CardTitle>
          <CardDescription>Defaults applied to every generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dtone">Default email tone</Label>
              <Select defaultValue="professional">
                <SelectTrigger id="dtone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["formal", "friendly", "professional", "persuasive", "concise"].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dlen">Default length</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="dlen">
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
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <Label htmlFor="autoTone" className="text-sm font-medium">
                Match tone to recipient
              </Label>
              <p className="text-xs text-muted-foreground">
                Adjust formality based on who you're writing to.
              </p>
            </div>
            <Switch id="autoTone" checked={prefs.autoTone} onCheckedChange={toggle("autoTone")} />
          </div>
          <AiDisclaimer />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Data & privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { k: "saveHistory" as const, t: "Save generation history", d: "Keep past drafts and summaries in your workspace." },
            { k: "trainingData" as const, t: "Improve AI with my content", d: "Off by default. Your content is never used to train models unless enabled." },
          ].map((row) => (
            <div key={row.k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <Label htmlFor={row.k} className="text-sm font-medium">
                  {row.t}
                </Label>
                <p className="text-xs text-muted-foreground">{row.d}</p>
              </div>
              <Switch id={row.k} checked={prefs[row.k]} onCheckedChange={toggle(row.k)} />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => toast.success("Export requested", { description: "We'll email you a copy shortly." })}
          >
            Export my data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
