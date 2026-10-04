import { createFileRoute } from "@tanstack/react-router";
import { Sun, Cloud, CloudRain, CloudLightning, Droplets, Thermometer, Umbrella, MapPin, BellRing, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useI18n } from "@/lib/i18n";
import { useStore, actions } from "@/lib/store";
import { getForecast, riskLevel, STATES } from "@/lib/weather";
import { PageHeader, Disclaimer } from "@/components/cg/ui";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/weather")({
  head: () => meta("Weather Risk", "Temperature, humidity, rainfall and a 7-day crop disease-risk forecast for your village."),
  component: Weather,
});

const ICONS = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudLightning };
const riskColor = (r: number) => (r >= 70 ? "var(--destructive)" : r >= 40 ? "var(--warning)" : "var(--success)");

export function LocationPicker() {
  const p = useStore((s) => s.profile);
  const districts = Object.keys(STATES[p.state] ?? {});
  const villages = STATES[p.state]?.[p.district] ?? [];
  const sel = "w-full rounded-xl border border-input bg-background px-3 py-3 font-medium";
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <select aria-label="State" className={sel} value={p.state} onChange={(e) => { const st = STATES[e.target.value]!; const d = Object.keys(st)[0]!; actions.updateProfile({ state: e.target.value, district: d, village: st[d]![0]! }); }}>
        {Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}
      </select>
      <select aria-label="District" className={sel} value={p.district} onChange={(e) => actions.updateProfile({ district: e.target.value, village: STATES[p.state]![e.target.value]![0]! })}>
        {districts.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select aria-label="Village" className={sel} value={p.village} onChange={(e) => actions.updateProfile({ village: e.target.value })}>
        {villages.map((s) => <option key={s}>{s}</option>)}
      </select>
    </div>
  );
}

function Weather() {
  const { t } = useI18n();
  const p = useStore((s) => s.profile);
  const f = getForecast(p.district + p.village);
  const today = f[0]!;
  const TodayIcon = ICONS[today.icon];
  const rising = f.findIndex((d, i) => i > 0 && d.risk >= 70);

  return (
    <div className="space-y-6">
      <PageHeader title={t("weather")} sub="Disease risk model using humidity, leaf wetness and temperature" />

      <section className="card-soft p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" />Your location</p>
        <LocationPicker />
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-sun p-6 text-accent-foreground shadow-lift">
          <TodayIcon className="absolute -right-4 -top-4 h-40 w-40 opacity-25" />
          <p className="font-semibold">{p.village}, {p.district}</p>
          <p className="mt-2 font-display text-6xl font-semibold">{today.temp}°</p>
          <p className="text-sm">Low {today.tempMin}° · Today</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[{ i: Droplets, l: "Humidity", v: `${today.humidity}%` }, { i: Umbrella, l: "Rain", v: `${today.rain} mm` }, { i: Thermometer, l: "Risk", v: `${today.risk}%` }].map((x) => (
              <div key={x.l} className="rounded-2xl bg-card/50 p-3"><x.i className="h-4 w-4" /><p className="mt-1 font-bold">{x.v}</p><p className="text-xs opacity-80">{x.l}</p></div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {rising > 0 && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="flex items-center gap-2 font-bold text-destructive"><TrendingUp className="h-5 w-5" />Smart alert: risk rising</p>
              <p className="mt-1 text-sm">Risk climbs from {today.risk}% today to {f[rising]!.risk}% by {f[rising]!.day}. Spray preventive fungicide <b>before</b> the rain and avoid evening irrigation.</p>
            </div>
          )}
          <div className="card-soft p-4">
            <p className="mb-2 flex items-center gap-2 font-bold"><BellRing className="h-5 w-5 text-primary" />Watch for</p>
            <ul className="space-y-1.5 text-sm">
              <li>🍅 Tomato / 🥔 Potato Late Blight — cool + humid nights</li>
              <li>🌾 Wheat Rust — dew & 10–20°C</li>
              <li>🌾 Rice Blast — humidity above 90%</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card-soft p-5">
        <h2 className="mb-4 text-xl font-semibold">7-day disease-risk forecast</h2>
        <div className="-mx-1 mb-5 grid grid-cols-7 gap-1.5">
          {f.map((d) => {
            const I = ICONS[d.icon];
            const lvl = riskLevel(d.risk);
            return (
              <div key={d.day} className="flex flex-col items-center gap-1 rounded-2xl bg-muted px-1 py-3 text-center">
                <span className="text-xs font-semibold">{d.day}</span>
                <I className="h-5 w-5 text-soil" />
                <span className="text-sm font-bold">{d.temp}°</span>
                <span className="text-[10px] text-muted-foreground">{d.humidity}%</span>
                <span className={cn("mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold", lvl === "high" ? "bg-destructive text-destructive-foreground" : lvl === "moderate" ? "bg-warning/30" : "bg-success/20")}>{d.risk}%</span>
              </div>
            );
          })}
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={f} margin={{ left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="risk" radius={[8, 8, 0, 0]}>{f.map((d) => <Cell key={d.day} fill={riskColor(d.risk)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Demo forecast. Connect a live weather API in production.</p>
      </section>
      <Disclaimer />
    </div>
  );
}
