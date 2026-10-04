import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImageUp, Sparkles, Sun, Focus, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { CROPS, type CropId } from "@/lib/diseases";
import { activeClassifier } from "@/lib/ai/classifier";
import { actions } from "@/lib/store";
import { Disclaimer, PageHeader } from "@/components/cg/ui";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/scan")({
  head: () => meta("AI Crop Scanner", "Upload or capture a crop leaf photo and get an instant AI disease diagnosis."),
  component: Scanner,
});

const STEPS = ["Detecting leaf area", "Analyzing texture & lesions", "Matching disease patterns", "Preparing recommendations"];

async function resize(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
  const max = 640;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.8);
}

function Scanner() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [crop, setCrop] = useState<CropId>("tomato");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const uploadRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File): Promise<void> => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    setImage(await resize(f));
  };

  const analyze = async () => {
    if (!image) return;
    setBusy(true); setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    try {
      const p = await activeClassifier.classify({ imageDataUrl: image, crop });
      const id = `scan-${Date.now()}`;
      actions.addScan({ id, crop, image, createdAt: Date.now(), ...p });
      nav({ to: "/result/$id", params: { id } });
    } catch {
      toast.error("Analysis failed. Please try again.");
      setBusy(false);
    } finally { clearInterval(timer); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("scanCrop")} sub={lang === "hi" ? "फसल चुनें, पत्ती की साफ फोटो लें।" : "Choose your crop, then take a clear photo of one leaf."} />

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold">{t("selectCrop")}</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {CROPS.map((c) => (
            <button key={c.id} onClick={() => setCrop(c.id)} disabled={busy}
              className={cn("press flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-semibold transition-colors",
                crop === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
              <span>{c.emoji}</span>{lang === "hi" ? c.hi : c.en}
            </button>
          ))}
        </div>
      </div>

      <div className="card-soft overflow-hidden p-3">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <img src={image} alt="Selected leaf" className="h-full w-full object-cover" />
          ) : (
            <button onClick={() => uploadRef.current?.click()} className="flex flex-col items-center gap-3 p-6 text-center text-muted-foreground">
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                <Leaf className="h-9 w-9" />
              </span>
              <span className="font-semibold text-foreground">Tap to add a leaf photo</span>
              <span className="text-sm">JPG or PNG · single leaf works best</span>
            </button>
          )}
          {/* Corner brackets */}
          <div className="pointer-events-none absolute inset-6">
            {["left-0 top-0 border-l-4 border-t-4 rounded-tl-xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl"].map((c) => (
              <span key={c} className={cn("absolute h-8 w-8 border-primary-glow", c)} />
            ))}
          </div>
          {busy && (
            <div className="absolute inset-0 bg-forest/55 backdrop-blur-[1px]">
              <div className="absolute inset-x-0 h-1 bg-primary-glow shadow-[0_0_24px_6px_var(--primary-glow)] animate-scanline" />
              <div className="absolute inset-0 bg-[linear-gradient(var(--primary-glow)_1px,transparent_1px),linear-gradient(90deg,var(--primary-glow)_1px,transparent_1px)] bg-[size:28px_28px] opacity-15" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest/85 p-4 text-forest-foreground">
                <p className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 animate-pulse text-primary-glow" />{t("analyzing")}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {STEPS.map((s, i) => (
                    <li key={s} className={cn("transition-opacity", i <= step ? "opacity-100" : "opacity-35")}>{i < step ? "✓" : i === step ? "◉" : "○"} {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button disabled={busy} onClick={() => camRef.current?.click()} className="press flex items-center justify-center gap-2 rounded-2xl bg-secondary py-4 font-bold text-secondary-foreground disabled:opacity-50">
            <Camera className="h-5 w-5" />{t("camera")}
          </button>
          <button disabled={busy} onClick={() => uploadRef.current?.click()} className="press flex items-center justify-center gap-2 rounded-2xl bg-secondary py-4 font-bold text-secondary-foreground disabled:opacity-50">
            <ImageUp className="h-5 w-5" />{t("upload")}
          </button>
        </div>
        <button disabled={!image || busy} onClick={analyze}
          className="press mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-5 text-lg font-bold text-primary-foreground shadow-lift disabled:opacity-40 disabled:shadow-none">
          <Sparkles className="h-5 w-5" />{busy ? t("analyzing") : lang === "hi" ? "AI से जांचें" : "Analyze with AI"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[{ i: Sun, t: "Use natural daylight" }, { i: Focus, t: "Fill the frame with one leaf" }, { i: Leaf, t: "Show affected spots clearly" }].map((x) => (
          <div key={x.t} className="flex items-center gap-3 rounded-2xl bg-muted p-3 text-sm font-medium"><x.i className="h-5 w-5 text-primary" />{x.t}</div>
        ))}
      </div>
      <Disclaimer className="mt-5" />
    </div>
  );
}
