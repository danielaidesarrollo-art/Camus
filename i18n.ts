import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app_name": "Daniel AI - Camus",
            "hud_status": "HUD Status",
            "optimal": "Optimal",
            "emergency": "Emergency",
            "copilot": "AI Copilot",
            "loading_camus": "Loading Camus...",
            "dashboard": "Dashboard",
            "patient_list": "Patient List",
            "handover": "Handover",
            "schedule": "Schedule",
            "map": "Map",
            "routes": "Routes",
            "staff": "Staff",
            "production": "Production",
            "profile": "Profile"
        }
    },
    es: {
        translation: {
            "app_name": "Daniel AI - Camus",
            "hud_status": "Estado HUD",
            "optimal": "Óptimo",
            "emergency": "Emergencia",
            "copilot": "Copiloto IA",
            "loading_camus": "Cargando Camus...",
            "dashboard": "Panel Control",
            "patient_list": "Lista Pacientes",
            "handover": "Entrega Turno",
            "schedule": "Agenda",
            "map": "Mapa",
            "routes": "Rutas",
            "staff": "Personal",
            "production": "Producción",
            "profile": "Perfil"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage']
        }
    });

export default i18n;
