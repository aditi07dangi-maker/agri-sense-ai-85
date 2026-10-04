import { useSyncExternalStore } from "react";
import type { CropId } from "@/lib/diseases";
import { diseaseById } from "@/lib/diseases";

export interface Scan {
  id: string;
  crop: CropId;
  diseaseId: string;
  confidence: number;
  alternatives: { diseaseId: string; confidence: number }[];
  image: string; // data URL or asset url
  createdAt: number;
  model: string;
}

export interface Profile {
  name: string;
  phone: string;
  isGuest: boolean;
  loggedIn: boolean;
  state: string;
  district: string;
  village: string;
  crops: CropId[];
  notifications: { riskAlerts: boolean; weekly: boolean; sms: boolean };
}

interface State { scans: Scan[]; profile: Profile; seeded: boolean }

const KEY = "cropguard-v1";
const DEFAULT: State = {
  scans: [],
  seeded: false,
  profile: {
    name: "", phone: "", isGuest: true, loggedIn: false,
    state: "Maharashtra", district: "Nashik", village: "Pimpalgaon",
    crops: ["tomato", "wheat", "potato"],
    notifications: { riskAlerts: true, weekly: true, sms: false },
  },
};

let state: State = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function seed(): Scan[] {
  const day = 86400000;
  const now = Date.now();
  const mk = (i: number, crop: CropId, diseaseId: string, confidence: number, daysAgo: number): Scan => ({
    id: `demo-${i}`, crop, diseaseId, confidence, alternatives: [], image: "", createdAt: now - daysAgo * day, model: "cropguard-demo-v1 (simulated)",
  });
  return [
    mk(1, "tomato", "tomato-early-blight", 0.91, 1),
    mk(2, "wheat", "wheat-rust", 0.84, 3),
    mk(3, "potato", "potato-healthy", 0.95, 5),
    mk(4, "tomato", "tomato-healthy", 0.88, 9),
    mk(5, "potato", "potato-late-blight", 0.53, 12),
    mk(6, "wheat", "wheat-healthy", 0.93, 16),
    mk(7, "tomato", "tomato-healthy", 0.9, 21),
  ];
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  if (!state.seeded) state = { ...state, seeded: true, scans: seed() };
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  queueMicrotask(l);
  return () => listeners.delete(l);
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => { load(); return sel(state); }, () => sel(DEFAULT));
}

export const actions = {
  addScan(scan: Scan) { set({ scans: [scan, ...state.scans] }); },
  deleteScan(id: string) { set({ scans: state.scans.filter((s) => s.id !== id) }); },
  clearHistory() { set({ scans: [] }); },
  updateProfile(p: Partial<Profile>) { set({ profile: { ...state.profile, ...p } }); },
  login(name: string, phone: string) { set({ profile: { ...state.profile, name, phone, loggedIn: true, isGuest: false } }); },
  guest() { set({ profile: { ...state.profile, isGuest: true, loggedIn: false } }); },
  logout() { set({ profile: { ...state.profile, loggedIn: false, isGuest: true, name: "", phone: "" } }); },
};

const SEV_SCORE = { low: 0, moderate: 30, high: 50, critical: 70 } as const;

/** Health score 0-100 for one scan */
export function scanHealth(s: Scan) {
  const d = diseaseById(s.diseaseId);
  if (s.diseaseId.endsWith("-healthy")) return Math.round(88 + s.confidence * 10);
  return Math.max(8, Math.round(95 - SEV_SCORE[d.severity] * s.confidence - 15));
}

export function cropHealth(scans: Scan[], crop?: CropId) {
  const list = (crop ? scans.filter((s) => s.crop === crop) : scans).slice(0, 4);
  if (!list.length) return null;
  return Math.round(list.reduce((a, s) => a + scanHealth(s), 0) / list.length);
}
