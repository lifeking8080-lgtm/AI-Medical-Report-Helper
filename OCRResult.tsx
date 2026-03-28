import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { performOCR } from "../utils/ocr";
import { Language } from "../utils/translations";

interface OCRResultProps {
  imageFile: File | null;
  onAnalyze: (text: string) => void;
  language: Language;
  translations: any;
}

export function OCRResult({ imageFile, onAnalyze, language, translations }: OCRResultProps) {
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError(translations[language].noImage);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const text = await performOCR(imageFile);
      
      if (!text || text.trim().length === 0) {
        setError(translations[language].noText);
        setIsProcessing(false);
        return;
      }

      setExtractedText(text);
      onAnalyze(text);
    } catch (err) {
      console.error("OCR Error:", err);
      setError(translations[language].noText);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!extractedText && !isProcessing && !error) {
    return (
      <Button
        onClick={handleAnalyze}
        disabled={!imageFile || isProcessing}
        className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {translations[language].analyzing}
          </>
        ) : (
          translations[language].analyze
        )}
      </Button>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">{translations[language].extractedText}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</p>
        ) : (
          <div className="bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{extractedText}</p>
          </div>
        )}
        {!error && (
          <Button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {translations[language].analyzing}
              </>
            ) : (
              translations[language].analyze
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}