
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "@/locales/translations";

type Language = "en" | "th";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("en");

    // Optional: Persist language to localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("app-language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "th")) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguageState(savedLang);
        }
    }, []);

    // Toggle lang-th class on body for Thai font styling
    useEffect(() => {
        if (language === "th") {
            document.body.classList.add("lang-th");
        } else {
            document.body.classList.remove("lang-th");
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("app-language", lang);
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
