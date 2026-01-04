import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import uk from './locales/uk.json';
import ru from './locales/ru.json';
import be from './locales/be.json';
import ka from './locales/ka.json';
import hy from './locales/hy.json';
import kk from './locales/kk.json';
import uz from './locales/uz.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import pl from './locales/pl.json';
import cs from './locales/cs.json';
import ro from './locales/ro.json';
import hu from './locales/hu.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import he from './locales/he.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  uk: { translation: uk },
  ru: { translation: ru },
  be: { translation: be },
  ka: { translation: ka },
  hy: { translation: hy },
  kk: { translation: kk },
  uz: { translation: uz },
  fr: { translation: fr },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  de: { translation: de },
  pl: { translation: pl },
  cs: { translation: cs },
  ro: { translation: ro },
  hu: { translation: hu },
  ja: { translation: ja },
  ko: { translation: ko },
  he: { translation: he },
  ar: { translation: ar },
  zh: { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export const initializeLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    if (savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }
};

export default i18n;