import { useState } from "react";
import { ImageInput } from "./components/ImageInput";
import { OCRResult } from "./components/OCRResult";
import { AnalysisResultView } from "./components/AnalysisResult";
import { Disclaimer } from "./components/Disclaimer";
import { translations, Language } from "./utils/translations";
import { Activity } from "lucide-react";
import { analyzeText, AnalysisResult } from "./utils/ai-simulator";

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [imageData, setImageData] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleImageCapture = (data: string, file: File) => {
    setImageData(data);
    setImageFile(file);
    setExtractedText("");
    setAnalysis(null);
  };

  const handleAnalyze = (text: string) => {
    setExtractedText(text);
    const result = analyzeText(text, language);
    setAnalysis(result);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (extractedText) {
      const result = analyzeText(extractedText, lang);
      setAnalysis(result);
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-blue-600 text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MedRead</h1>
            <p className="text-blue-100 text-sm">Medical Report Interpreter</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-5 space-y-6">
          <ImageInput 
            onImageCapture={handleImageCapture}
            language={language}
            translations={translations}
          />
          
          {imageFile && (
            <OCRResult
              imageFile={imageFile}
              onAnalyze={handleAnalyze}
              language={language}
              translations={translations}
            />
          )}

          {extractedText && (
            <AnalysisResultView
              analysis={analysis}
              language={language}
              onLanguageChange={handleLanguageChange}
              text={extractedText}
            />
          )}
        </div>
      </div>

      <Disclaimer language={language} />
    </div>
  );
}

export default App;