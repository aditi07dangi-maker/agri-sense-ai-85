import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore, actions, cropHealth, scanHealth } from "@/lib/store";
import { CROPS, cropById, diseaseById, type CropId } from "@/lib/diseases";
import { HealthRing, PageHeader, Disclaimer } from "@/components/cg/ui";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/crops")({
  head: () => meta("My Crops", "Track health scores, disease history and trends for every crop you grow."),
  component: Crops,
});

function Crops() {
  const { t, lang } = useI18n();
  const scans = useStore((s) => s.scans);
  const mine = useStore((s) => s.profile.crops);
  const [sel, setSel] = useState<CropId | null>(null);
  const [adding, setAdding] = useState(false);
  const selected = sel ?? mine[0];

  const trend = [...scans].filter((s) => !selected || s.crop === selected).reverse()
    .map((s) => ({ date: new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }), health: scanHealth(s) }));

  return (
    <div className="space-y-6">
      <PageHeader title={t("crops")} sub="Health scores from your latest scans"
        action={<button onClick={() => setAdding(!adding)} className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"><Plus className="h-4 w-4" />Add crop</button>} />

      {adding && (
        <div className="card-soft flex flex-wrap gap-2 p-4 animate-rise">
          {CROPS.filter((c) => !mine.includes(c.id)).map((c) => (
            <button key={c.id} onClick={() => { actions.updateProfile({ crops: [...mine, c.id] }); setAdding(false); }} className="press rounded-full border border-border bg-background px-4 py-2 font-semibold hover:border-primary">{c.emoji} {lang === "hi" ? c.hi : c.en}</button>
          ))}
          {CROPS.every((c) => mine.includes(c.id)) && <p className="text-sm text-muted-foreground">All supported crops added.</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {mine.map((id) => {
          const c = cropById(id);
          const h = cropHealth(scans, id);
          const last = scans.find((s) => s.crop === id);
          return (
            <div key={id} role="button" tabIndex={0} onClick={() => setSel(id)}
              className={cn("card-soft press relative cursor-pointer p-4 text-left transition-all", selected === id && "ring-2 ring-primary")}>
              <button aria-label="Remove crop" onClick={(e) => { e.stopPropagation(); actions.updateProfile({ crops: mine.filter((x) => x !== id) }); }} className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <HealthRing value={h} size={64} />
              </div>
              <p className="mt-3 font-display text-lg font-semibold">{lang === "hi" ? c.hi : c.en}</p>
              <p className="truncate text-xs text-muted-foreground">{last ? diseaseById(last.diseaseId).name : "No scans yet"}</p>
            </div>
          );
        })}
      </div>

      <section className="card-soft p-5">
        <h2 className="mb-1 text-xl font-semibold">Health trend · {selected ? cropById(selected).en : "All"}</h2>
        <p className="mb-4 text-sm text-muted-foreground">Higher is healthier. Each point is one scan.</p>
        {trend.length > 1 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -20, right: 8 }}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="health" stroke="var(--primary)" strokeWidth={3} fill="url(#hg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-10 text-center text-muted-foreground">Scan this crop at least twice to see a trend. <Link to="/scan" className="font-semibold text-primary">Scan now</Link></p>}
      </section>

      <section className="card-soft p-5">
        <h2 className="mb-3 text-xl font-semibold">Disease history</h2>
        <ul className="space-y-2">
          {scans.filter((s) => s.crop === selected).map((s) => (
            <li key={s.id}><Link to="/result/$id" params={{ id: s.id }} className="flex justify-between rounded-xl bg-muted px-4 py-3 text-sm hover:bg-secondary">
              <span className="font-semibold">{diseaseById(s.diseaseId).name}</span><span className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
            </Link></li>
          ))}
        </ul>
      </section>
      <Disclaimer />
    </div>
  );
}
