import { createFileRoute } from "@tanstack/react-router";
import { Send, Leaf, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DISEASES } from "@/lib/diseases";
import { PageHeader } from "@/components/cg/ui";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/assistant")({
  head: () => meta("AI Assistant", "Ask simple crop-health questions and get instant guidance in Hindi or English."),
  component: Assistant,
});

type Msg = { role: "user" | "bot"; text: string };

/** Rule-based demo assistant. Replace `reply` with a call to an LLM server function later. */
function reply(q: string): string {
  const s = q.toLowerCase();
  const d = DISEASES.find((x) => s.includes(x.crop) && (s.includes("blight") || s.includes("rust") || s.includes("blast") || s.includes("spot") || s.includes(x.name.toLowerCase().split(" ").slice(-1)[0]!.toLowerCase())))
    ?? DISEASES.find((x) => s.includes(x.name.toLowerCase()));
  if (d) return `**${d.name}** (${d.pathogen}).\n\nTreatment: ${d.treatment[0]}. ${d.treatment[1] ?? ""}\n\nPrevention: ${d.prevention.join("; ")}.`;
  if (/yellow|पील/.test(s)) return "Yellow leaves can mean nitrogen deficiency, overwatering, or early fungal infection. Check if yellowing starts on older leaves (nutrient) or has spots (disease). Scan the leaf for a precise check.";
  if (/spray|time|छिड़क/.test(s)) return "Spray early morning or late evening, when wind is low and no rain is expected for 6 hours. Always wear gloves and a mask, and follow label dosage.";
  if (/rain|weather|बारिश|मौसम/.test(s)) return "After 2+ days of rain with high humidity, fungal risk rises sharply. Check the Weather Risk page and consider a preventive spray before the wet spell.";
  if (/organic|neem|जैविक/.test(s)) return "Neem oil (5 ml/L with a few drops of soap) works as a mild preventive for many fungal and pest issues. Trichoderma for soil and seed treatment is also effective.";
  return "I can help with crop diseases, symptoms, sprays and weather risk. Try asking: \"How to treat tomato early blight?\" or \"Why are my wheat leaves yellow?\" For anything serious, please consult an expert.";
}

const SUGGEST = ["How to treat tomato late blight?", "Wheat rust prevention", "Best time to spray?", "Why are leaves turning yellow?", "पत्तियां पीली क्यों हो रही हैं?"];

function Assistant() {
  const { t } = useI18n();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Namaste! 🌱 I'm your CropGuard assistant. Ask me anything about crop health." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput(""); setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, { role: "bot", text: reply(text) }]); setTyping(false); }, 900);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={t("assistant")} sub="Quick answers for everyday crop questions" />
      <div className="card-soft flex min-h-[55vh] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex gap-2 animate-rise", m.role === "user" && "justify-end")}>
              {m.role === "bot" && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Leaf className="h-4 w-4" /></span>}
              <div className={cn("max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm", m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted")}>
                {m.text.replace(/\*\*/g, "")}
              </div>
            </div>
          ))}
          {typing && <div className="flex gap-1 pl-10">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>}
          <div ref={end} />
        </div>
        <div className="-mx-1 my-3 flex gap-2 overflow-x-auto px-1">
          {SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="press shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary">{s}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your crop…" className="flex-1 rounded-full border border-input bg-background px-5 py-3.5 outline-none focus:ring-2 focus:ring-ring" />
          <button aria-label="Send" className="press flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
        </form>
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><Stethoscope className="h-4 w-4" />Guidance only — not a substitute for an agricultural expert.</p>
    </div>
  );
}
