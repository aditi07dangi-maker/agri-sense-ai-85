import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { actions } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/login")({
  head: () => meta("Login", "Sign in to CropGuard AI or continue as a guest."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string | null>(null);

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!otp) {
      if (name.trim().length < 2 || !/^\d{10}$/.test(phone)) { toast.error("Enter your name and a 10-digit mobile number"); return; }
      setOtp(""); toast("Demo OTP: 1234");
      return;
    }
    if (otp !== "1234") { toast.error("Incorrect OTP (demo: 1234)"); return; }
    actions.login(name.trim(), `+91 ${phone}`);
    toast.success(`Welcome, ${name.trim()}!`);
    nav({ to: "/" });
  };

  const field = "w-full rounded-2xl border border-input bg-background py-4 pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="card-soft p-6 animate-rise">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground"><Leaf className="h-7 w-7" /></span>
        <h1 className="mt-4 text-center text-3xl font-semibold">Welcome to CropGuard</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Login to sync scans across devices</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative"><User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input className={field} placeholder="Your name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></div>
          <div className="relative"><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input className={field} inputMode="numeric" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></div>
          {otp !== null && <input className="w-full rounded-2xl border border-input bg-background py-4 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring" inputMode="numeric" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} autoFocus />}
          <button className="press w-full rounded-2xl bg-gradient-primary py-4 text-lg font-bold text-primary-foreground shadow-lift">{otp === null ? "Send OTP" : "Verify & Login"}</button>
        </form>
        <button onClick={() => { actions.guest(); nav({ to: "/" }); }} className="mt-3 w-full rounded-2xl bg-secondary py-4 font-bold">Continue as guest</button>
      </div>
    </div>
  );
}
