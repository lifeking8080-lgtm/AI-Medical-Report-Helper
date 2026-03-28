import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { analyzeText, AnalysisResult } from "../utils/ai-simulator";
import { translations, Language } from "../utils/translations";

interface AnalysisResultViewProps {
  analysis: AnalysisResult | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  text: string;
}

export function AnalysisResultView({ analysis, language, onLanguageChange, text }: AnalysisResultViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Slightly High":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakAnalysis();
    }
  };

  const speakAnalysis = () => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const currentAnalysis = analyzeText(text, language);
    const fullText = `${currentAnalysis.explanation} ${currentAnalysis.precautions.join(". ")} ${currentAnalysis.tips.join(". ")}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    
    const langMap: Record<Language, string> = {
      en: "en-US",
      hi: "hi-IN",
      mr: "mr-IN",
    };
    utterance.lang = langMap[language];
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getLocalAnalysis = () => {
    if (!text) return null;
    return analyzeText(text, language);
  };

  const currentAnalysis = analysis || getLocalAnalysis();

  if (!currentAnalysis) return null;

  const t = translations[language];
  const statusKey = currentAnalysis.status.replace(/\s+/g, "") as keyof typeof t;

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t.analysis}</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(val) => onLanguageChange(val as Language)}>
                <SelectTrigger className="w-32 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="mr">मराठी</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleVoiceToggle}
                variant={isSpeaking ? "destructive" : "default"}
                size="icon"
                className="h-10 w-10"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(currentAnalysis.status)}`}>
            {t[statusKey] || currentAnalysis.status}
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-base text-slate-800 leading-relaxed">{currentAnalysis.explanation}</p>
          </div>
          
          {currentAnalysis.precautions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                {t.precautions}
              </h3>
              <ul className="space-y-2">
                {currentAnalysis.precautions.map((precaution, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-700">
                    <span className="text-amber-500 mr-2 mt-1">•</span>
                    {precaution}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentAnalysis.tips.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                {t.healthTips}
              </h3>
              <ul className="space-y-2">
                {currentAnalysis.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-700">
                    <span className="text-emerald-500 mr-2 mt-1">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}