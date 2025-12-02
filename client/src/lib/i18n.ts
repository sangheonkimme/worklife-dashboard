import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import commonKo from "@/locales/ko/common.json";
import settingsKo from "@/locales/ko/settings.json";
import dashboardKo from "@/locales/ko/dashboard.json";
import financeKo from "@/locales/ko/finance.json";
import notesKo from "@/locales/ko/notes.json";
import authKo from "@/locales/ko/auth.json";
import widgetsKo from "@/locales/ko/widgets.json";
import systemKo from "@/locales/ko/system.json";
import salaryKo from "@/locales/ko/salary.json";
import profileKo from "@/locales/ko/profile.json";
import commonEn from "@/locales/en/common.json";
import settingsEn from "@/locales/en/settings.json";
import dashboardEn from "@/locales/en/dashboard.json";
import financeEn from "@/locales/en/finance.json";
import notesEn from "@/locales/en/notes.json";
import authEn from "@/locales/en/auth.json";
import widgetsEn from "@/locales/en/widgets.json";
import systemEn from "@/locales/en/system.json";
import salaryEn from "@/locales/en/salary.json";
import profileEn from "@/locales/en/profile.json";

export type SupportedLanguage = "ko" | "en";
export type LanguagePreference = SupportedLanguage | "system";

const LANGUAGE_STORAGE_KEY = "worklife-language";

const resources = {
  ko: {
    common: commonKo,
    settings: settingsKo,
    dashboard: dashboardKo,
    finance: financeKo,
    notes: notesKo,
    auth: authKo,
    widgets: widgetsKo,
    system: systemKo,
    salary: salaryKo,
    profile: profileKo,
  },
  en: {
    common: commonEn,
    settings: settingsEn,
    dashboard: dashboardEn,
    finance: financeEn,
    notes: notesEn,
    auth: authEn,
    widgets: widgetsEn,
    system: systemEn,
    salary: salaryEn,
    profile: profileEn,
  },
} as const;

const SUPPORTED_LANGUAGES = Object.keys(resources) as SupportedLanguage[];

const normalizeLanguageCode = (input?: string | null): SupportedLanguage => {
  if (!input) return "ko";
  const lower = input.toLowerCase();
  if (lower.startsWith("en")) return "en";
  return "ko";
};

const detectInitialLanguage = (): SupportedLanguage => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  }

  if (typeof navigator !== "undefined") {
    return normalizeLanguageCode(navigator.language);
  }

  return "ko";
};

export const resolveLanguagePreference = (
  preference: LanguagePreference
): SupportedLanguage => {
  if (preference === "system") {
    return normalizeLanguageCode(
      typeof navigator !== "undefined" ? navigator.language : null
    );
  }
  return preference;
};

export const applyLanguagePreference = (
  preference: LanguagePreference
): SupportedLanguage => {
  const resolved = resolveLanguagePreference(preference);

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", resolved);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  }

  i18n.changeLanguage(resolved).catch(() => {
    // swallow change errors, i18next logs internally
  });

  return resolved;
};

/**
 * IP 기반 언어 감지 후 적용 (첫 방문자 전용)
 * localStorage에 언어 설정이 없을 때만 IP 기반으로 감지합니다.
 */
export const applyLanguageByIP = async (): Promise<void> => {
  // 이미 언어 설정이 있으면 건너뜀
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return;
    }
  }

  try {
    // 동적 import로 geoService 로드
    const { detectLanguageByIP } = await import("@/services/geoService");
    const detectedLanguage = await detectLanguageByIP();

    applyLanguagePreference(detectedLanguage);
  } catch (error) {
    // IP 감지 실패 시 브라우저 언어로 폴백
    console.warn("IP 기반 언어 감지 실패, 브라우저 언어 사용:", error);
  }
};

if (!i18n.isInitialized) {
  const initialLanguage = detectInitialLanguage();

  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: "ko",
      supportedLngs: SUPPORTED_LANGUAGES,
      ns: [
        "common",
        "settings",
        "dashboard",
        "finance",
        "notes",
        "auth",
        "widgets",
        "system",
        "salary",
        "profile",
      ],
      defaultNS: "common",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      },
      react: {
        useSuspense: true,
      },
    });

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", initialLanguage);
  }
}

export default i18n;
