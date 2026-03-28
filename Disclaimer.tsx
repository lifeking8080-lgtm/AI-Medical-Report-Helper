import { translations, Language } from "../utils/translations";

interface DisclaimerProps {
  language: Language;
}

export function Disclaimer({ language }: DisclaimerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-100 border-t border-slate-200 p-3 text-center">
      <p className="text-xs text-slate-500 leading-relaxed">
        {translations[language].disclaimer}
      </p>
    </div>
  );
}