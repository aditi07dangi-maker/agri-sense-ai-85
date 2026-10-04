import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, CloudRain, BookOpen, MessageCircle, Sprout, AlertTriangle, ChevronRight, Stethoscope, Droplets, Thermometer } from "lucide-react";
import hero from "@/assets/hero-leaf.jpg";
import { useI18n } from "@/lib/i18n";
import { useStore, cropHealth, scanHealth } from "@/lib/store";
import { diseaseById, cropById } from "@/lib/diseases";
import { getForecast, riskLevel } from "@/lib/weather";
import { Disclaimer, HealthRing, ScanThumb, SeverityBadge, timeAgo } from "@/components/cg/ui";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Dashboard", "Your crop health score, disease-risk level, recent AI scans and quick actions in one place."),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const scans = useStore((s) => s.scans);
  const profile = useStore((s) => s.profile);
  const health = cropHealth(scans);
  const forecast = getForecast(profile.district);
  const peak = forecast.reduce((a, b) => (b.risk > a.risk ? b : a));
  const today = forecast[0]!;
  const level = riskLevel(peak.risk);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-forest text-forest-foreground shadow-lift animate-rise">
        <img src={hero} alt="Healthy tomato leaf in a field" width={1280} height={896} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/10" />
        <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-primary-glow">{t("greeting")}, {profile.name || t("farmer")} 👋</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-5xl">
              {lang === "hi" ? "रोग फैलने से पहले पहचानें।" : "Catch crop disease before it spreads."}
            </h1>
            <p className="mt-3 text-forest-foreground/80">{t("heroSub")}</p>
            <Link to="/scan" className="press mt-6 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-lg font-bold text-accent-foreground shadow-lift hover:brightness-105">
              <ScanLine className="h-6 w-6" /> {t("scanCrop")}
            </Link>
          </div>
          <div className="flex items-center gap-5 rounded-2xl bg-forest/60 p-5 backdrop-blur md:flex-col">
            <HealthRing value={health} label="/ 100" />
            <div className="md:text-center">
              <p className="text-sm opacity-80">{t("healthScore")}</p>
              <p className="font-display text-lg">{health && health >= 75 ? "Looking good" : health && health >= 50 ? "Needs attention" : "At risk"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk alert */}
      {level !== "low" && (
        <Link to="/weather" className="press flex items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 animate-rise">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <span className="absolute inset-0 rounded-full bg-destructive animate-pulse-ring" />
            <AlertTriangle className="relative h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-bold">{t("alertTitle")} — {peak.day} ({peak.risk}%)</p>
            <p className="text-sm text-muted-foreground">Humidity {peak.humidity}% + rain expected. Late blight & rust favoured in {profile.district}.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: t("riskLevel"), value: t(level), icon: AlertTriangle, tone: level === "high" ? "text-destructive" : "text-soil" },
          { label: "Temperature", value: `${today.temp}°C`, icon: Thermometer, tone: "text-soil" },
          { label: "Humidity", value: `${today.humidity}%`, icon: Droplets, tone: "text-chart-4" },
          { label: "Scans this month", value: String(scans.length), icon: ScanLine, tone: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="card-soft p-4">
            <s.icon className={`h-5 w-5 ${s.tone}`} />
            <p className="mt-3 font-display text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent scans */}
        <section className="card-soft p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("recentScans")}</h2>
            <Link to="/history" className="text-sm font-semibold text-primary">{t("viewAll")}</Link>
          </div>
          <ul className="divide-y divide-border">
            {scans.slice(0, 4).map((s) => {
              const d = diseaseById(s.diseaseId);
              return (
                <li key={s.id}>
                  <Link to="/result/$id" params={{ id: s.id }} className="flex items-center gap-3 py-3 transition-colors hover:text-primary">
                    <ScanThumb scan={s} className="h-12 w-12 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{lang === "hi" ? d.nameHi : d.name}</p>
                      <p className="text-xs text-muted-foreground">{cropById(s.crop).en} · {timeAgo(s.createdAt)} · {Math.round(s.confidence * 100)}%</p>
                    </div>
                    <span className="text-sm font-bold">{scanHealth(s)}</span>
                    <SeverityBadge level={d.severity} />
                  </Link>
                </li>
              );
            })}
            {!scans.length && <p className="py-6 text-center text-muted-foreground">No scans yet.</p>}
          </ul>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/scan", label: t("scanCrop"), icon: ScanLine, cls: "bg-gradient-primary text-primary-foreground" },
              { to: "/weather", label: t("weather"), icon: CloudRain, cls: "bg-gradient-sun text-accent-foreground" },
              { to: "/crops", label: t("crops"), icon: Sprout, cls: "card-soft" },
              { to: "/library", label: t("library"), icon: BookOpen, cls: "card-soft" },
              { to: "/assistant", label: t("assistant"), icon: MessageCircle, cls: "card-soft" },
              { to: "/profile", label: t("expert"), icon: Stethoscope, cls: "card-soft" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className={`press flex min-h-24 flex-col justify-between rounded-2xl p-4 font-semibold hover:-translate-y-0.5 ${a.cls}`}>
                <a.icon className="h-6 w-6" />
                <span className="text-sm leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Disclaimer />
    </div>
  );
}
