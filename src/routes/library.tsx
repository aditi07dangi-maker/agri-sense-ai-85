import { createFileRoute } from "@tanstack/react-router";
import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CROPS, DISEASES, cropById, type CropId } from "@/lib/diseases";
import { PageHeader, SeverityBadge, Disclaimer } from "@/components/cg/ui";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/library")({
  head: () => meta("Disease Library", "Searchable guide to common crop diseases — symptoms, causes, treatment and prevention."),
  component: Library,
});

function Library() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [crop, setCrop] = useState<CropId | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = DISEASES.filter((d) => (crop === "all" || d.crop === crop) &&
    [d.name, d.nameHi, d.pathogen, ...d.symptoms].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <PageHeader title={t("library")} sub={`${DISEASES.length} diseases across ${CROPS.length} crops`} />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="w-full rounded-2xl border border-input bg-card py-4 pl-12 pr-4 text-base shadow-[var(--shadow-soft)] outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {[{ id: "all" as const, en: "All", hi: "सभी", emoji: "🌱" }, ...CROPS].map((c) => (
          <button key={c.id} onClick={() => setCrop(c.id)} className={cn("press shrink-0 rounded-full px-4 py-2 text-sm font-semibold", crop === c.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>{c.emoji} {lang === "hi" ? c.hi : c.en}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((d) => (
          <article key={d.id} className="card-soft overflow-hidden">
            <button onClick={() => setOpen(open === d.id ? null : d.id)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-2xl">{cropById(d.crop).emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold leading-tight">{lang === "hi" ? d.nameHi : d.name}</h3>
                <p className="truncate text-xs italic text-muted-foreground">{d.pathogen}</p>
              </div>
              <SeverityBadge level={d.severity} />
              <ChevronDown className={cn("h-5 w-5 transition-transform", open === d.id && "rotate-180")} />
            </button>
            {open === d.id && (
              <div className="space-y-3 border-t border-border p-4 text-sm animate-rise">
                {[[t("symptoms"), d.symptoms], [t("treatment"), d.treatment], [t("prevention"), d.prevention]].map(([h, items]) => (
                  <div key={h as string}><p className="mb-1 font-bold">{h as string}</p><ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">{(items as string[]).map((i) => <li key={i}>{i}</li>)}</ul></div>
                ))}
                <p className="rounded-xl bg-muted p-2.5 text-xs">☁️ Favoured by: {d.favours}</p>
              </div>
            )}
          </article>
        ))}
      </div>
      {!list.length && <p className="py-10 text-center text-muted-foreground">No diseases match your search.</p>}
      <Disclaimer />
    </div>
  );
}
