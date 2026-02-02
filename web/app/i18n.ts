import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      // This is the URL path the browser fetches, 
      // usually mapped to your 'public' folder by Vite/Webpack
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;