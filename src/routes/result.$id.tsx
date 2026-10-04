import { createFileRoute, Link, useNavigate, useHydrated } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Stethoscope, ScanLine, Trash2, Pill, ShieldCheck, Activity, CloudRain } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useStore, actions, scanHealth } from "@/lib/store";
import { diseaseById, cropById } from "@/lib/diseases";
import { LOW_CONFIDENCE } from "@/lib/ai/classifier";
import { Disclaimer, ScanThumb, SeverityBadge, SeverityMeter, timeAgo } from "@/components/cg/ui";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/result/$id")({
  head: () => meta("Scan Result", "AI disease diagnosis with confidence score, severity, symptoms and treatment advice."),
  component: Result,
});

function Result() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const hydrated = useHydrated();
  const scan = useStore((s) => s.scans.find((x) => x.id === id));

  if (!scan) {
    return (
      <div className="py-20 text-center">
        {hydrated ? (<><p className="text-lg font-semibold">Scan not found</p><Link to="/history" className="mt-3 inline-block font-semibold text-primary">Go to history</Link></>) : <p className="text-muted-foreground">Loading…</p>}
      </div>
    );
  }

  const d = diseaseById(scan.diseaseId);
  const healthy = scan.diseaseId.endsWith("-healthy");
  const conf = Math.round(scan.confidence * 100);
  const low = scan.confidence < LOW_CONFIDENCE;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="card-soft overflow-hidden animate-rise md:grid md:grid-cols-[280px_1fr]">
        <ScanThumb scan={scan} className="aspect-square w-full text-7xl md:h-full" />
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{cropById(scan.crop).emoji} {lang === "hi" ? cropById(scan.crop).hi : cropById(scan.crop).en}</span>·<span>{timeAgo(scan.createdAt)}</span>
          </div>
          <div className="mt-2 flex items-start gap-2">
            {healthy ? <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-success" /> : <AlertTriangle className="mt-1 h-7 w-7 shrink-0 text-destructive" />}
            <div>
              <h1 className="text-3xl font-semibold leading-tight">{lang === "hi" ? d.nameHi : d.name}</h1>
              <p className="text-sm italic text-muted-foreground">{d.pathogen}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("confidence")}</p>
              <p className="font-display text-4xl font-semibold">{conf}<span className="text-xl">%</span></p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className={low ? "h-full bg-warning" : "h-full bg-gradient-primary"} style={{ width: `${conf}%`, transition: "width 1s" }} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Health score</p>
              <p className="font-display text-4xl font-semibold">{scanHealth(scan)}</p>
              <SeverityBadge level={d.severity} />
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("severity")}</p>
            <SeverityMeter level={d.severity} />
          </div>
        </div>
      </section>

      {low && (
        <div className="flex gap-3 rounded-2xl border-2 border-warning bg-warning/15 p-4 animate-rise">
          <AlertTriangle className="h-6 w-6 shrink-0 text-soil" />
          <div>
            <p className="font-bold">{lang === "hi" ? "AI अनिश्चित है" : "AI is uncertain"}</p>
            <p className="text-sm">{t("lowConf")}</p>
            {scan.alternatives.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">Other possibilities: {scan.alternatives.map((a) => `${diseaseById(a.diseaseId).name} (${Math.round(a.confidence * 100)}%)`).join(", ")}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: t("symptoms"), items: d.symptoms, icon: Activity, tone: "text-destructive" },
          { title: t("treatment"), items: d.treatment, icon: Pill, tone: "text-primary" },
          { title: t("prevention"), items: d.prevention, icon: ShieldCheck, tone: "text-soil" },
        ].map((b) => (
          <section key={b.title} className="card-soft p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><b.icon className={`h-5 w-5 ${b.tone}`} />{b.title}</h2>
            <ul className="space-y-2 text-sm">
              {b.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{i}</li>)}
            </ul>
          </section>
        ))}
      </div>

      {!healthy && (
        <p className="flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm"><CloudRain className="h-5 w-5 text-chart-4" /> Favoured by: {d.favours}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/scan" className="press flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 font-bold text-primary-foreground shadow-lift"><ScanLine className="h-5 w-5" />Scan again</Link>
        <button onClick={() => toast.success("Expert request sent", { description: "A Krishi expert will call you within 24 hours." })} className="press flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-bold text-accent-foreground"><Stethoscope className="h-5 w-5" />{t("expert")}</button>
        <button onClick={() => { actions.deleteScan(scan.id); toast("Scan deleted"); nav({ to: "/history" }); }} className="press flex items-center justify-center gap-2 rounded-2xl border border-destructive/40 py-4 font-bold text-destructive"><Trash2 className="h-5 w-5" />Delete scan</button>
      </div>

      <p className="text-center text-xs text-muted-foreground">Model: {scan.model}</p>
      <Disclaimer />
    </div>
  );
}
