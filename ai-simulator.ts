import { translations, Language, TranslationKey } from "./translations";

export interface AnalysisResult {
  status: "Normal" | "Slightly High" | "High" | "Low" | "Abnormal";
  explanation: string;
  precautions: string[];
  tips: string[];
}

export interface ParsedValue {
  name: string;
  value: number;
  unit: string;
}

const medicalPatterns = [
  { regex: /glucose|sugar|blood\s*sugar/i, name: "glucose", normalMin: 70, normalMax: 100 },
  { regex: /hemoglobin|hb|hgb/i, name: "hemoglobin", normalMin: 12, normalMax: 16 },
  { regex: /blood\s*pressure|bp|systolic|diastolic/i, name: "bp", normalMin: 90, normalMax: 120 },
  { regex: /cholesterol|total\s*cholesterol/i, name: "cholesterol", normalMin: 150, normalMax: 200 },
  { regex: /platelet|platelets/i, name: "platelets", normalMin: 150, normalMax: 450 },
];

function extractValue(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (!match) return null;
  const valueMatch = match[0]?.match(/\d+\.?\d*/);
  return valueMatch ? parseFloat(valueMatch[0]) : null;
}

function parseMedicalText(text: string): ParsedValue[] {
  const results: ParsedValue[] = [];
  const lowerText = text.toLowerCase();

  for (const pattern of medicalPatterns) {
    if (pattern.regex.test(lowerText)) {
      const value = extractValue(text, /\d+\.?\d*\s*(mg\/dl|g\/dl|mm\/hg|mmol\/l)?/i);
      if (value !== null) {
        results.push({
          name: pattern.name,
          value,
          unit: "units",
        });
      }
    }
  }

  return results;
}

function getStatus(value: number, normalMin: number, normalMax: number): AnalysisResult["status"] {
  if (value < normalMin * 0.8) return "Low";
  if (value < normalMin) return "Low";
  if (value > normalMax * 1.3) return "High";
  if (value > normalMax) return "Slightly High";
  return "Normal";
}

function getExplanation(name: string, status: AnalysisResult["status"], language: Language): string {
  const key = `${name}${status}` as TranslationKey;
  return translations[language][key] || translations[language].unknownResult;
}

function getPrecautions(name: string, status: AnalysisResult["status"], language: Language): string[] {
  const precautions: string[] = [];
  const t = translations[language];

  if (status === "High" || status === "Slightly High") {
    if (name === "glucose") precautions.push(t.tipExercise);
    if (name === "bp") precautions.push(t.tipWater);
    if (name === "cholesterol") precautions.push(t.tipFruits);
  }

  if (status === "Low") {
    if (name === "hemoglobin") precautions.push(t.tipFruits);
    precautions.push(t.tipDoctor);
  }

  if (precautions.length === 0) {
    precautions.push(t.tipWater, t.tipExercise);
  }

  return precautions;
}

function getTips(language: Language): string[] {
  const t = translations[language];
  return [t.tipWater, t.tipExercise, t.tipSleep, t.tipFruits].slice(0, 3);
}

export function analyzeText(text: string, language: Language): AnalysisResult {
  const parsedValues = parseMedicalText(text);

  if (parsedValues.length === 0) {
    return {
      status: "Abnormal",
      explanation: translations[language].unknownResult,
      precautions: [translations[language].tipDoctor],
      tips: getTips(language),
    };
  }

  const firstResult = parsedValues[0];
  const pattern = medicalPatterns.find((p) => p.name === firstResult.name);
  
  if (!pattern) {
    return {
      status: "Abnormal",
      explanation: translations[language].unknownResult,
      precautions: [translations[language].tipDoctor],
      tips: getTips(language),
    };
  }

  const status = getStatus(firstResult.value, pattern.normalMin, pattern.normalMax);
  const explanation = getExplanation(firstResult.name, status, language);
  const precautions = getPrecautions(firstResult.name, status, language);
  const tips = getTips(language);

  return {
    status,
    explanation,
    precautions,
    tips,
  };
}