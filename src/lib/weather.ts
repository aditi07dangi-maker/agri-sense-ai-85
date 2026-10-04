/** Demo weather + disease-risk model. Replace `getForecast` with a real weather API later. */
export interface DayForecast {
  day: string; temp: number; tempMin: number; humidity: number; rain: number; risk: number; icon: "sun" | "cloud" | "rain" | "storm";
}

const BASE = [
  { temp: 29, tempMin: 20, humidity: 62, rain: 0, icon: "sun" },
  { temp: 28, tempMin: 21, humidity: 70, rain: 2, icon: "cloud" },
  { temp: 26, tempMin: 20, humidity: 82, rain: 12, icon: "rain" },
  { temp: 24, tempMin: 19, humidity: 91, rain: 28, icon: "storm" },
  { temp: 23, tempMin: 18, humidity: 93, rain: 18, icon: "rain" },
  { temp: 25, tempMin: 18, humidity: 84, rain: 4, icon: "cloud" },
  { temp: 27, tempMin: 19, humidity: 72, rain: 0, icon: "sun" },
] as const;

/** Fungal risk rises with humidity, leaf wetness (rain) and mild temps (18–28°C). */
export function riskScore(temp: number, humidity: number, rain: number) {
  const h = Math.max(0, (humidity - 55) / 45);
  const r = Math.min(1, rain / 20);
  const t = temp >= 16 && temp <= 28 ? 1 : 0.5;
  return Math.round(Math.min(100, (h * 0.6 + r * 0.4) * 100 * t + 8));
}

export function getForecast(location: string): DayForecast[] {
  const offset = location.length % 3;
  const names = ["Today", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return BASE.map((b, i) => {
    const temp = b.temp + offset - 1;
    return { day: names[i]!, ...b, temp, risk: riskScore(temp, b.humidity, b.rain) };
  });
}

export const riskLevel = (r: number) => (r >= 70 ? "high" : r >= 40 ? "moderate" : "low") as "low" | "moderate" | "high";

export const STATES: Record<string, Record<string, string[]>> = {
  Maharashtra: { Nashik: ["Pimpalgaon", "Niphad", "Sinnar"], Pune: ["Baramati", "Junnar", "Indapur"] },
  Punjab: { Ludhiana: ["Khanna", "Jagraon", "Samrala"], Bathinda: ["Rampura", "Talwandi Sabo"] },
  "Uttar Pradesh": { Agra: ["Fatehabad", "Kheragarh"], Meerut: ["Sardhana", "Mawana"] },
  "Madhya Pradesh": { Indore: ["Depalpur", "Mhow"], Ujjain: ["Nagda", "Tarana"] },
  Gujarat: { Rajkot: ["Gondal", "Jetpur"], Surat: ["Bardoli", "Mandvi"] },
};
