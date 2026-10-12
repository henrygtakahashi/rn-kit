import { en } from '@/core/i18n/locales/en';
import { ptBR } from '@/core/i18n/locales/pt-BR';
import { getLocales } from 'expo-localization';
import i18next, { init, use as registerI18nextPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['en', 'pt-BR'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function resolveLanguage(languageTag: string | undefined): SupportedLanguage {
  if (languageTag?.toLowerCase().startsWith('pt')) return 'pt-BR';
  return 'en';
}

export function initI18n() {
  if (i18next.isInitialized) return i18next;
  registerI18nextPlugin(initReactI18next);
  void init({
    resources: { en: { translation: en }, 'pt-BR': { translation: ptBR } },
    lng: resolveLanguage(getLocales()[0]?.languageTag),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return i18next;
}
