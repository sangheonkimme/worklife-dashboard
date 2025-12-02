import type { SupportedLanguage } from "@/lib/i18n";

const GEO_CACHE_KEY = "worklife-geo-country";
const GEO_CACHE_EXPIRY_KEY = "worklife-geo-country-expiry";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24시간

// 한국 IP인 경우 한국어, 그 외는 영어
const KOREAN_COUNTRY_CODE = "KR";

interface GeoResponse {
  country_code?: string;
  country?: string;
}

/**
 * IP 기반으로 사용자의 국가 코드를 가져옵니다.
 * 무료 API 사용 (ipapi.co)
 */
export const detectCountryByIP = async (): Promise<string | null> => {
  // 캐시 확인
  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    const expiry = localStorage.getItem(GEO_CACHE_EXPIRY_KEY);

    if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
      return cached;
    }
  }

  try {
    // ipapi.co - 무료 API (하루 1000회 제한)
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: GeoResponse = await response.json();
    const countryCode = data.country_code || null;

    // 캐시 저장
    if (countryCode && typeof localStorage !== "undefined") {
      localStorage.setItem(GEO_CACHE_KEY, countryCode);
      localStorage.setItem(
        GEO_CACHE_EXPIRY_KEY,
        String(Date.now() + CACHE_DURATION_MS)
      );
    }

    return countryCode;
  } catch (error) {
    console.warn("IP 기반 국가 감지 실패:", error);
    return null;
  }
};

/**
 * 국가 코드를 기반으로 언어를 결정합니다.
 * - 한국(KR): 한국어
 * - 그 외: 영어
 */
export const getLanguageByCountry = (
  countryCode: string | null
): SupportedLanguage => {
  if (countryCode === KOREAN_COUNTRY_CODE) {
    return "ko";
  }
  return "en";
};

/**
 * IP 기반으로 언어를 감지합니다.
 * localStorage에 이미 언어 설정이 있으면 그것을 우선합니다.
 */
export const detectLanguageByIP = async (): Promise<SupportedLanguage> => {
  const countryCode = await detectCountryByIP();
  return getLanguageByCountry(countryCode);
};
