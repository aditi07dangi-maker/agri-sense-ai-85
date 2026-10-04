export type CropId = "tomato" | "wheat" | "rice" | "potato" | "soybean" | "maize" | "cotton";
export type Severity = "low" | "moderate" | "high" | "critical";

export const CROPS: { id: CropId; en: string; hi: string; emoji: string }[] = [
  { id: "tomato", en: "Tomato", hi: "टमाटर", emoji: "🍅" },
  { id: "wheat", en: "Wheat", hi: "गेहूं", emoji: "🌾" },
  { id: "rice", en: "Rice", hi: "धान", emoji: "🌾" },
  { id: "potato", en: "Potato", hi: "आलू", emoji: "🥔" },
  { id: "soybean", en: "Soybean", hi: "सोयाबीन", emoji: "🫘" },
  { id: "maize", en: "Maize", hi: "मक्का", emoji: "🌽" },
  { id: "cotton", en: "Cotton", hi: "कपास", emoji: "☁️" },
];

export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!;

export interface Disease {
  id: string;
  crop: CropId;
  name: string;
  nameHi: string;
  pathogen: string;
  severity: Severity;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  favours: string; // weather conditions
}

export const DISEASES: Disease[] = [
  {
    id: "tomato-early-blight", crop: "tomato", name: "Tomato Early Blight", nameHi: "टमाटर अगेती झुलसा",
    pathogen: "Alternaria solani (fungus)", severity: "moderate",
    symptoms: ["Brown spots with concentric 'target' rings on older leaves", "Yellowing around lesions", "Lower leaves dry and drop early"],
    treatment: ["Remove and destroy infected lower leaves", "Spray Mancozeb 75% WP (2.5 g/L) or Chlorothalonil at 7–10 day intervals", "Avoid overhead irrigation"],
    prevention: ["Rotate with non-solanaceous crops for 2–3 years", "Mulch to stop soil splash", "Maintain plant spacing for airflow"],
    favours: "Warm (24–29°C), humid weather with leaf wetness",
  },
  {
    id: "tomato-late-blight", crop: "tomato", name: "Tomato Late Blight", nameHi: "टमाटर पछेती झुलसा",
    pathogen: "Phytophthora infestans (oomycete)", severity: "critical",
    symptoms: ["Large, greasy dark-green to brown patches", "White fuzzy growth on leaf underside in humid mornings", "Firm brown rot on fruits"],
    treatment: ["Immediately remove infected plants", "Spray Metalaxyl + Mancozeb (2.5 g/L)", "Repeat every 7 days during wet spells"],
    prevention: ["Use certified disease-free seedlings", "Avoid late evening irrigation", "Monitor closely after cool rainy nights"],
    favours: "Cool (15–22°C), very humid or rainy weather",
  },
  {
    id: "potato-late-blight", crop: "potato", name: "Potato Late Blight", nameHi: "आलू पछेती झुलसा",
    pathogen: "Phytophthora infestans (oomycete)", severity: "critical",
    symptoms: ["Water-soaked spots turning black at leaf tips and edges", "White mildew ring on underside", "Brown, rotting tubers"],
    treatment: ["Spray Cymoxanil + Mancozeb (3 g/L)", "Destroy affected haulms before harvest", "Do not store infected tubers"],
    prevention: ["Plant certified seed tubers", "Earth-up ridges to protect tubers", "Prophylactic spray when fog and drizzle persist"],
    favours: "Cool, foggy weather with humidity above 90%",
  },
  {
    id: "wheat-rust", crop: "wheat", name: "Wheat Rust (Yellow/Brown)", nameHi: "गेहूं का रतुआ",
    pathogen: "Puccinia spp. (fungus)", severity: "high",
    symptoms: ["Yellow or orange-brown powdery pustules in stripes", "Powder rubs off on fingers", "Leaves dry prematurely, grains shrivel"],
    treatment: ["Spray Propiconazole 25% EC (1 ml/L)", "Repeat after 15 days if pustules persist", "Report outbreak to local KVK"],
    prevention: ["Sow rust-resistant varieties (e.g. HD 3086, DBW 187)", "Avoid excess nitrogen", "Timely sowing"],
    favours: "Cool (10–20°C) with dew or light rain",
  },
  {
    id: "rice-blast", crop: "rice", name: "Rice Blast", nameHi: "धान का झोंका रोग",
    pathogen: "Magnaporthe oryzae (fungus)", severity: "high",
    symptoms: ["Spindle-shaped spots with grey centre and brown border", "Neck turns black and breaks", "Empty or chaffy panicles"],
    treatment: ["Spray Tricyclazole 75% WP (0.6 g/L)", "Drain field briefly if severe", "Reduce nitrogen top dressing"],
    prevention: ["Use resistant varieties", "Seed treatment with Carbendazim (2 g/kg)", "Balanced fertilisation"],
    favours: "Humid nights (>90% RH), 24–28°C, long leaf wetness",
  },
  {
    id: "cotton-leaf-spot", crop: "cotton", name: "Cotton Leaf Spot", nameHi: "कपास पत्ती धब्बा",
    pathogen: "Alternaria / Cercospora (fungus)", severity: "moderate",
    symptoms: ["Small round brown spots with purple margins", "Spots merge into irregular patches", "Premature leaf fall"],
    treatment: ["Spray Copper oxychloride (3 g/L) or Mancozeb", "Remove heavily infected leaves", "Ensure potassium is not deficient"],
    prevention: ["Destroy crop residue after harvest", "Avoid dense planting", "Balanced NPK with potash"],
    favours: "Warm, humid weather after rain",
  },
  {
    id: "maize-leaf-blight", crop: "maize", name: "Maize Turcicum Leaf Blight", nameHi: "मक्का पत्ती झुलसा",
    pathogen: "Exserohilum turcicum (fungus)", severity: "moderate",
    symptoms: ["Long cigar-shaped grey-green lesions", "Lesions turn tan with dark spores", "Leaves wither from bottom"],
    treatment: ["Spray Mancozeb (2.5 g/L) at first symptoms", "Second spray after 10 days"],
    prevention: ["Resistant hybrids", "Crop rotation", "Residue management"],
    favours: "Moderate temperature (18–27°C) with heavy dew",
  },
  {
    id: "soybean-rust", crop: "soybean", name: "Soybean Rust", nameHi: "सोयाबीन रतुआ",
    pathogen: "Phakopsora pachyrhizi (fungus)", severity: "high",
    symptoms: ["Tiny tan to reddish-brown lesions on leaf underside", "Raised volcano-like pustules", "Rapid yellowing and defoliation"],
    treatment: ["Spray Hexaconazole 5% EC (2 ml/L)", "Repeat at 15 day interval if needed"],
    prevention: ["Early sowing", "Tolerant varieties", "Field scouting after continuous rain"],
    favours: "Long leaf wetness, 15–28°C",
  },
];

export const HEALTHY = (crop: CropId): Disease => ({
  id: `${crop}-healthy`, crop, name: `Healthy ${cropById(crop).en}`, nameHi: `स्वस्थ ${cropById(crop).hi}`,
  pathogen: "No pathogen detected", severity: "low",
  symptoms: ["Uniform green colour", "No visible lesions or pustules"],
  treatment: ["No treatment needed"],
  prevention: ["Keep scouting weekly", "Maintain balanced nutrition and irrigation"],
  favours: "—",
});

export const diseaseById = (id: string): Disease => {
  const d = DISEASES.find((x) => x.id === id);
  if (d) return d;
  const crop = id.replace("-healthy", "") as CropId;
  return HEALTHY(crop);
};
