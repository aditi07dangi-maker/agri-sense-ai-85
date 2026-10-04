import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, GitCompare, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useStore, actions, scanHealth, type Scan } from "@/lib/store";
import { diseaseById, cropById } from "@/lib/diseases";
import { PageHeader, ScanThumb, SeverityBadge, timeAgo, Disclaimer } from "@/components/cg/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/history")({
  head: () => meta("Scan History", "Review, compare and manage your previous crop scans and AI results."),
  component: History,
});

function History() {
  const { t, lang } = useI18n();
  const scans = useStore((s) => s.scans);
  const [compare, setCompare] = useState<string[]>([]);
  const toggle = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.slice(-1), id]));
  const pair = compare.map((id) => scans.find((s) => s.id === id)).filter(Boolean) as Scan[];

  return (
    <div className="space-y-5">
      <PageHeader title={t("history")} sub="Select two scans to compare"
        action={scans.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger className="press inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-bold text-destructive"><Trash2 className="h-4 w-4" />Clear all</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete all scan history?</AlertDialogTitle><AlertDialogDescription>This removes all {scans.length} scans from this device. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { actions.clearHistory(); setCompare([]); toast("History cleared"); }}>Delete all</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )} />

      {pair.length === 2 && (
        <section className="card-soft p-4 animate-rise">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><GitCompare className="h-5 w-5 text-primary" />Comparison</h2><button onClick={() => setCompare([])} aria-label="Close"><X className="h-5 w-5" /></button></div>
          <div className="grid grid-cols-2 gap-3">
            {pair.map((s) => { const d = diseaseById(s.diseaseId); return (
              <div key={s.id} className="rounded-2xl bg-muted p-3">
                <ScanThumb scan={s} className="aspect-square w-full rounded-xl text-5xl" />
                <p className="mt-2 font-semibold leading-tight">{d.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                <div className="mt-2 flex items-center justify-between text-sm"><span>Health <b>{scanHealth(s)}</b></span><span>{Math.round(s.confidence * 100)}%</span></div>
              </div>); })}
          </div>
          {(() => { const diff = scanHealth(pair[1]) - scanHealth(pair[0]); return (
            <p className={cn("mt-3 rounded-xl p-3 text-center text-sm font-bold", diff >= 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>
              Health {diff >= 0 ? "improved" : "dropped"} by {Math.abs(diff)} points
            </p>); })()}
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scans.map((s) => {
          const d = diseaseById(s.diseaseId);
          const on = compare.includes(s.id);
          return (
            <div key={s.id} className={cn("card-soft flex gap-3 p-3 transition-all", on && "ring-2 ring-primary")}>
              <Link to="/result/$id" params={{ id: s.id }}><ScanThumb scan={s} className="h-20 w-20 rounded-xl text-3xl" /></Link>
              <div className="min-w-0 flex-1">
                <Link to="/result/$id" params={{ id: s.id }} className="block truncate font-semibold hover:text-primary">{lang === "hi" ? d.nameHi : d.name}</Link>
                <p className="text-xs text-muted-foreground">{cropById(s.crop).en} · {timeAgo(s.createdAt)} · {Math.round(s.confidence * 100)}%</p>
                <div className="mt-2 flex items-center gap-2">
                  <SeverityBadge level={d.severity} />
                  <button onClick={() => toggle(s.id)} className={cn("press rounded-full px-2.5 py-1 text-xs font-bold", on ? "bg-primary text-primary-foreground" : "bg-secondary")}>{on ? "Selected" : "Compare"}</button>
                  <button onClick={() => { actions.deleteScan(s.id); setCompare((c) => c.filter((x) => x !== s.id)); toast("Scan deleted"); }} aria-label="Delete scan" className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!scans.length && <div className="py-16 text-center"><p className="text-muted-foreground">No scans yet.</p><Link to="/scan" className="mt-3 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">{t("scanCrop")}</Link></div>}
      <Disclaimer />
    </div>
  );
}
