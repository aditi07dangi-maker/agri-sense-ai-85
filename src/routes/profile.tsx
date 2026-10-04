import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Globe, MapPin, LogOut, Stethoscope, Phone, UserCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useStore, actions } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Disclaimer } from "@/components/cg/ui";
import { LocationPicker } from "./weather";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/profile")({
  head: () => meta("Profile & Settings", "Manage language, notifications, location and saved preferences."),
  component: Profile,
});

function Profile() {
  const { t, lang, setLang } = useI18n();
  const p = useStore((s) => s.profile);
  const n = p.notifications;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={t("profile")} />

      <section className="flex items-center gap-4 rounded-3xl bg-gradient-forest p-5 text-forest-foreground shadow-lift">
        <UserCircle2 className="h-16 w-16 opacity-90" />
        <div className="flex-1">
          <p className="font-display text-xl font-semibold">{p.loggedIn ? p.name : "Guest farmer"}</p>
          <p className="text-sm opacity-80">{p.loggedIn ? p.phone : "Data saved on this device only"}</p>
        </div>
        {p.loggedIn
          ? <button onClick={() => { actions.logout(); toast("Logged out"); }} className="press flex items-center gap-1.5 rounded-full bg-sidebar-accent px-4 py-2 text-sm font-semibold"><LogOut className="h-4 w-4" />Logout</button>
          : <Link to="/login" className="press rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground">Login</Link>}
      </section>

      <section className="card-soft p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Globe className="h-5 w-5 text-primary" />{t("language")}</h2>
        <div className="grid grid-cols-2 gap-2">
          {([["en", "English"], ["hi", "हिंदी"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setLang(k)} className={cn("press rounded-2xl border-2 py-4 text-lg font-bold", lang === k ? "border-primary bg-primary/10 text-primary" : "border-border")}>{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">More regional languages (मराठी, ਪੰਜਾਬੀ, తెలుగు) coming soon.</p>
      </section>

      <section className="card-soft p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><MapPin className="h-5 w-5 text-primary" />State / District / Village</h2>
        <LocationPicker />
      </section>

      <section className="card-soft divide-y divide-border p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><Bell className="h-5 w-5 text-primary" />Notifications</h2>
        {([["riskAlerts", "Disease-risk alerts", "When weather raises disease risk"], ["weekly", "Weekly health summary", "Every Monday morning"], ["sms", "SMS alerts", "For phones without internet"]] as const).map(([k, l, d]) => (
          <label key={k} className="flex items-center justify-between py-3">
            <span><span className="block font-medium">{l}</span><span className="text-xs text-muted-foreground">{d}</span></span>
            <Switch checked={n[k]} onCheckedChange={(v) => actions.updateProfile({ notifications: { ...n, [k]: v } })} />
          </label>
        ))}
      </section>

      <section className="card-soft p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><Stethoscope className="h-5 w-5 text-primary" />Expert consultation</h2>
        <p className="mb-3 text-sm text-muted-foreground">Connect with a certified agronomist or your nearest Krishi Vigyan Kendra.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button onClick={() => toast.success("Callback requested", { description: "An expert will call you within 24 hours." })} className="press flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-bold text-primary-foreground"><Stethoscope className="h-5 w-5" />Request callback</button>
          <a href="tel:18001801551" className="press flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 font-bold"><Phone className="h-5 w-5" />Kisan Call Centre 1800-180-1551</a>
        </div>
      </section>

      <button onClick={() => { actions.clearHistory(); toast("All scan data deleted"); }} className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 py-3.5 font-bold text-destructive"><Trash2 className="h-5 w-5" />Delete all my scan data</button>
      <Disclaimer />
    </div>
  );
}
