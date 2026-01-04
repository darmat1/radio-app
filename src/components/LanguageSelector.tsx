'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
  { code: 'be', name: 'Беларуская' },
  { code: 'ka', name: 'ქართული' },
  { code: 'hy', name: 'Հայերեն' },
  { code: 'kk', name: 'Қазақша' },
  { code: 'uz', name: 'O\'zbek' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pl', name: 'Polski' },
  { code: 'cs', name: 'Čeština' },
  { code: 'ro', name: 'Română' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'he', name: 'עברית' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
    setSelectedLanguage(currentLang);
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <span className="text-sm text-white">{selectedLanguage.name}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                language.code === i18n.language ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}