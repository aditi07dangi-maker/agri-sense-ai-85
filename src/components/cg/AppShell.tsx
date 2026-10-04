import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ScanLine, Sprout, CloudSun, BookOpen, History, MessageCircle, User, Leaf, Languages } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n, type TKey } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV: { to: string; key: TKey; icon: typeof Home }[] = [
  { to: "/", key: "home", icon: Home },
  { to: "/scan", key: "scan", icon: ScanLine },
  { to: "/crops", key: "crops", icon: Sprout },
  { to: "/weather", key: "weather", icon: CloudSun },
  { to: "/library", key: "library", icon: BookOpen },
  { to: "/history", key: "history", icon: History },
  { to: "/assistant", key: "assistant", icon: MessageCircle },
  { to: "/profile", key: "profile", icon: User },
];

const MOBILE: TKey[] = ["home", "crops", "scan", "weather", "assistant"];

function LangToggle({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className={cn("press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
        dark ? "bg-sidebar-accent text-sidebar-accent-foreground" : "bg-secondary text-secondary-foreground")}
      aria-label="Toggle language">
      <Languages className="h-4 w-4" /> {lang === "en" ? "हिंदी" : "English"}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const profile = useStore((s) => s.profile);
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-forest p-5 text-sidebar-foreground md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Leaf className="h-5 w-5" /></span>
          <span className="font-display text-xl font-semibold">CropGuard <span className="text-sidebar-primary">AI</span></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className={cn("press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active(n.to) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent")}>
              <n.icon className="h-[18px] w-[18px]" /> {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t border-sidebar-border pt-4">
          <LangToggle dark />
          <p className="text-xs opacity-70">{profile.loggedIn ? profile.name : "Guest mode"} · {profile.district}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Leaf className="h-4 w-4" /></span>
            <span className="font-display text-lg font-semibold">CropGuard <span className="text-primary">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <LangToggle />
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary" aria-label="Profile"><User className="h-4 w-4" /></Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          <div className="grid grid-cols-5 items-end">
            {MOBILE.map((k) => {
              const n = NAV.find((x) => x.key === k)!;
              if (k === "scan") return (
                <Link key={k} to="/scan" className="press -mt-6 flex flex-col items-center gap-1 pb-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-lift ring-4 ring-background"><ScanLine className="h-6 w-6" /></span>
                  <span className="text-[11px] font-bold text-primary">{t("scan")}</span>
                </Link>
              );
              return (
                <Link key={k} to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active(n.to) ? "text-primary" : "text-muted-foreground")}>
                  <n.icon className="h-5 w-5" /> {t(n.key).split(" ").slice(-1)[0]}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
