"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle = ({ className = "" }: LanguageToggleProps) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium tracking-widest ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setLanguage("en");
        }}
        className={`p-1 -m-1 transition-colors ${
          language === "en"
            ? "opacity-100 border-b border-current"
            : "opacity-60 hover:opacity-100"
        }`}
        style={{ color: "inherit" }}
      >
        {t.menu.english}
      </button>
      <span className="opacity-40">|</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setLanguage("th");
        }}
        className={`p-1 -m-1 transition-colors ${
          language === "th"
            ? "opacity-100 border-b border-current"
            : "opacity-60 hover:opacity-100"
        }`}
        style={{ color: "inherit" }}
      >
        {t.menu.thai}
      </button>
    </div>
  );
};

