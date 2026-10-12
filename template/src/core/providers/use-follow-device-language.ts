import { resolveLanguage } from '@/core/i18n/i18n';
import { useLocales } from 'expo-localization';
import { changeLanguage } from 'i18next';
import { useEffect } from 'react';

// Android recreates the activity when the app language changes, but the JS
// runtime keeps running, so i18next must follow the new locale itself.
export function useFollowDeviceLanguage() {
  const languageTag = useLocales()[0]?.languageTag;

  useEffect(() => {
    void changeLanguage(resolveLanguage(languageTag));
  }, [languageTag]);
}
