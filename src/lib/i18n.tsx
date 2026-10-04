import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  home: { en: "Home", hi: "होम" },
  scan: { en: "Scan", hi: "स्कैन" },
  scanCrop: { en: "Scan Your Crop", hi: "अपनी फसल स्कैन करें" },
  crops: { en: "My Crops", hi: "मेरी फसलें" },
  weather: { en: "Weather Risk", hi: "मौसम जोखिम" },
  library: { en: "Disease Library", hi: "रोग पुस्तकालय" },
  history: { en: "Scan History", hi: "स्कैन इतिहास" },
  assistant: { en: "AI Assistant", hi: "AI सहायक" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  greeting: { en: "Namaste", hi: "नमस्ते" },
  farmer: { en: "Farmer", hi: "किसान" },
  healthScore: { en: "Crop health score", hi: "फसल स्वास्थ्य स्कोर" },
  riskLevel: { en: "Disease risk", hi: "रोग जोखिम" },
  recentScans: { en: "Recent scans", hi: "हाल के स्कैन" },
  quickActions: { en: "Quick actions", hi: "त्वरित कार्य" },
  viewAll: { en: "View all", hi: "सभी देखें" },
  low: { en: "Low", hi: "कम" },
  moderate: { en: "Moderate", hi: "मध्यम" },
  high: { en: "High", hi: "अधिक" },
  critical: { en: "Critical", hi: "गंभीर" },
  heroSub: { en: "Snap a leaf. Know the disease in seconds. Act before it spreads.", hi: "पत्ती की फोटो लें। सेकंडों में रोग जानें। फैलने से पहले कदम उठाएं।" },
  upload: { en: "Upload photo", hi: "फोटो अपलोड करें" },
  camera: { en: "Use camera", hi: "कैमरा चालू करें" },
  analyzing: { en: "Analyzing leaf…", hi: "पत्ती का विश्लेषण…" },
  selectCrop: { en: "Select crop", hi: "फसल चुनें" },
  confidence: { en: "Confidence", hi: "विश्वास स्तर" },
  severity: { en: "Severity", hi: "गंभीरता" },
  symptoms: { en: "Symptoms", hi: "लक्षण" },
  treatment: { en: "Treatment", hi: "उपचार" },
  prevention: { en: "Prevention", hi: "रोकथाम" },
  expert: { en: "Talk to an expert", hi: "विशेषज्ञ से बात करें" },
  lowConf: { en: "Low confidence — the AI is unsure. Retake a clear, close photo in daylight or consult an expert.", hi: "कम विश्वास — AI निश्चित नहीं है। दिन के उजाले में साफ फोटो दोबारा लें या विशेषज्ञ से संपर्क करें।" },
  disclaimer: { en: "CropGuard AI provides preliminary AI-based guidance and is not a replacement for a qualified agricultural expert. AI predictions may be incorrect. Consult an agricultural professional for serious or uncertain cases.", hi: "CropGuard AI प्रारंभिक AI-आधारित मार्गदर्शन देता है और योग्य कृषि विशेषज्ञ का विकल्प नहीं है। AI अनुमान गलत हो सकते हैं। गंभीर या अनिश्चित मामलों में कृषि विशेषज्ञ से सलाह लें।" },
  language: { en: "Language", hi: "भाषा" },
  search: { en: "Search diseases, crops, symptoms…", hi: "रोग, फसल, लक्षण खोजें…" },
  alertTitle: { en: "Disease risk rising", hi: "रोग जोखिम बढ़ रहा है" },
} satisfies Record<string, Record<Lang, string>>;

export type TKey = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en", setLang: () => {}, t: (k) => dict[k].en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const l = localStorage.getItem("cropguard-lang");
    if (l === "hi" || l === "en") setLangState(l);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("cropguard-lang", l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
