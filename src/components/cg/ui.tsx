import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { cropById, type Severity } from "@/lib/diseases";
import type { Scan } from "@/lib/store";

export function Disclaimer({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground/80", className)}>
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-soil" />
      <p>{t("disclaimer")}</p>
    </div>
  );
}

export function HealthRing({ value, size = 120, label }: { value: number | null; size?: number; label?: string }) {
  const v = value ?? 0;
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const color = v >= 75 ? "var(--success)" : v >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.15} strokeWidth={10} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold">{value ?? "–"}</span>
        {label && <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>}
      </div>
    </div>
  );
}

const sevStyle: Record<Severity | "moderate" | "high" | "low", string> = {
  low: "bg-success/15 text-success",
  moderate: "bg-warning/20 text-soil",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export function SeverityBadge({ level }: { level: Severity }) {
  const { t } = useI18n();
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", sevStyle[level])}>{t(level)}</span>;
}

export function SeverityMeter({ level }: { level: Severity }) {
  const idx = ["low", "moderate", "high", "critical"].indexOf(level);
  const { t } = useI18n();
  return (
    <div>
      <div className="flex gap-1.5">
        {(["low", "moderate", "high", "critical"] as const).map((l, i) => (
          <div key={l} className={cn("h-3 flex-1 rounded-full transition-all", i <= idx
            ? ["bg-success", "bg-warning", "bg-destructive/80", "bg-destructive"][i] : "bg-muted")} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        {(["low", "moderate", "high", "critical"] as const).map((l) => <span key={l} className={l === level ? "font-bold text-foreground" : ""}>{t(l)}</span>)}
      </div>
    </div>
  );
}

export function ScanThumb({ scan, className }: { scan: Pick<Scan, "image" | "crop">; className?: string }) {
  if (scan.image) return <img src={scan.image} alt="" className={cn("object-cover", className)} />;
  return (
    <div className={cn("flex items-center justify-center bg-gradient-primary text-2xl", className)}>
      <span>{cropById(scan.crop).emoji}</span>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-rise">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function timeAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}
