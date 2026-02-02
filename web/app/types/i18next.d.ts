import 'i18next';
// Path goes up two levels to reach public from ./app/types/
import enTranslation from '../../public/locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslation;
    };
  }
}
