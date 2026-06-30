import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { LANGUAGES, type LanguageCode, type TranslationDict } from './types';
import en from './en';
import te from './te';
import hi from './hi';
import ta from './ta';
import kn from './kn';
import bn from './bn';

const dictionaries: Record<LanguageCode, TranslationDict> = { en, te, hi, ta, kn, bn };

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
  formatNumber: (n: number) => string;
  formatDate: (d: Date | string) => string;
  formatCurrency: (n: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'jalnetra-lang';

function getInitialLang(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(getInitialLang);

  const setLang = useCallback((newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[lang] || en;
      let str = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    },
    [lang],
  );

  const locale = LANGUAGES.find((l) => l.code === lang)?.locale || 'en-IN';

  const formatNumber = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(locale).format(n);
      } catch {
        return String(n);
      }
    },
    [locale],
  );

  const formatDate = useCallback(
    (d: Date | string) => {
      const date = typeof d === 'string' ? new Date(d) : d;
      try {
        return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
      } catch {
        return date.toLocaleDateString();
      }
    },
    [locale],
  );

  const formatCurrency = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
      } catch {
        return `₹${n}`;
      }
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, locale, formatNumber, formatDate, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { LANGUAGES };
export type { LanguageCode };
