import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: navigator.language.split('-')[0],
    fallbackLng: ['en'],
    detection: {
      checkWhitelist: true, // options for language detection
    },
    whitelist: ['en', 'de', 'fr'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
