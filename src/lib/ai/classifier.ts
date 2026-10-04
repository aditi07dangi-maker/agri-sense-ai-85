/**
 * Crop disease classifier abstraction.
 *
 * To connect a real image-classification model, implement `CropClassifier`
 * (e.g. call a server function that forwards the image to your ML API) and
 * swap `activeClassifier` below. The UI only depends on this interface.
 */
import { DISEASES, HEALTHY, type CropId } from "@/lib/diseases";

export interface Prediction {
  diseaseId: string;
  confidence: number; // 0..1
  alternatives: { diseaseId: string; confidence: number }[];
  model: string;
}

export interface CropClassifier {
  name: string;
  classify(input: { imageDataUrl: string; crop: CropId }): Promise<Prediction>;
}

// Deterministic hash so the same image gives the same demo result.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 97) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export const mockClassifier: CropClassifier = {
  name: "cropguard-demo-v1 (simulated)",
  async classify({ imageDataUrl, crop }) {
    await new Promise((r) => setTimeout(r, 2600));
    const h = hash(imageDataUrl + crop);
    const candidates = [...DISEASES.filter((d) => d.crop === crop).map((d) => d.id), HEALTHY(crop).id];
    const pool = candidates.length > 1 ? candidates : [...candidates, ...DISEASES.slice(0, 2).map((d) => d.id)];
    const top = pool[h % pool.length];
    // ~1 in 5 scans returns low confidence to demo the uncertainty warning
    const confidence = h % 5 === 0 ? 0.42 + (h % 15) / 100 : 0.72 + (h % 26) / 100;
    const alternatives = pool
      .filter((id) => id !== top)
      .slice(0, 2)
      .map((id, i) => ({ diseaseId: id, confidence: Math.max(0.02, (1 - confidence) * (i === 0 ? 0.65 : 0.3)) }));
    return { diseaseId: top, confidence: Math.min(confidence, 0.97), alternatives, model: this.name };
  },
};

export const activeClassifier: CropClassifier = mockClassifier;
export const LOW_CONFIDENCE = 0.6;
