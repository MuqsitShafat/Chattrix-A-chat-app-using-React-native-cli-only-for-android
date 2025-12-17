import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './languages/en.json';
import ur from './languages/ur.json';
import fr from './languages/fr.json';
import ar from './languages/ar.json';
import hi from './languages/hi.json';

const resources = { en: { translation: en }, ur: { translation: ur }, fr: { translation: fr }, ar: { translation: ar }, hi: { translation: hi } };
const LANGUAGE_KEY = 'appLanguage';
const FALLBACK_LANGUAGE = 'en';

// RTL: Urdu + Arabic
const setAppRTL = (languageTag) => {
  const isRTL = languageTag === 'ur' || languageTag === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

const detectAndInit = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    let languageTag = saved;

    if (!languageTag) {
      // Get device locales
      const locales = RNLocalize.getLocales();
      if (locales && locales.length > 0) {
        // Take the first locale
        const deviceLang = locales[0].languageCode;
        languageTag = resources[deviceLang] ? deviceLang : FALLBACK_LANGUAGE;
      } else {
        languageTag = FALLBACK_LANGUAGE;
      }
    }

    setAppRTL(languageTag);

    await i18n.use(initReactI18next).init({
      resources,
      lng: languageTag,
      fallbackLng: FALLBACK_LANGUAGE,
      compatibilityJSON: 'v3',
      interpolation: { escapeValue: false },
    });
  } catch (err) {
    console.warn('i18n init error', err);
  }
};

detectAndInit();

export const changeLanguage = async (lang) => {
  if (!resources[lang]) return;
  setAppRTL(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
