// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "language": "Language",
      "english": "English",
      "romanian": "Romanian",
      "select_language": "Select your preferred language",
      "language_settings": "Language Settings",
      "current_language": "Current Language",
      "apply_changes": "Apply Changes",
      "changes_saved": "Language preferences saved successfully",
      "restart_notice": "Some changes may require a page refresh to take effect",
      "welcome": "Welcome to our application",
      // Add more translations as needed
    }
  },
  ro: {
    translation: {
      "language": "Limba",
      "english": "Engleză",
      "romanian": "Română",
      "select_language": "Selectați limba preferată",
      "language_settings": "Setări de limbă",
      "current_language": "Limba curentă",
      "apply_changes": "Aplică modificările",
      "changes_saved": "Preferințele de limbă au fost salvate",
      "restart_notice": "Unele modificări pot necesita reîmprospătarea paginii",
      "welcome": "Bun venit în aplicația noastră",
      // Add more translations as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;