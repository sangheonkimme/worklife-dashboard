"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  IconUser,
  IconSparkles,
  IconWallet,
  IconBell,
  IconAdjustments,
  IconShieldLock,
  IconDatabase,
  IconCoin,
  IconCheck,
  IconLogout,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AuthRequiredWrapper } from "@/components/auth/AuthRequiredWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/useUiStore";

type SectionKey =
  | "profile"
  | "appearance"
  | "ledger"
  | "notifications"
  | "tools"
  | "security"
  | "data"
  | "account";

interface Tweaks {
  accent: "yellow" | "coral" | "mint" | "lilac";
  showCalendar: boolean;
  payday: number;
  paydayType: "fixed" | "lastDay" | "firstDay" | "custom";
  cycleStart: "payday" | "1st" | "custom";
  currency: "KRW" | "USD" | "JPY" | "EUR";
  fontFamily: "pretendard" | "jakarta" | "noto";
  fontSize: "s" | "m" | "l";
}

const TWEAKS_STORAGE_KEY = "wl-settings-tweaks";

const DEFAULT_TWEAKS: Tweaks = {
  accent: "yellow",
  showCalendar: true,
  payday: 25,
  paydayType: "fixed",
  cycleStart: "payday",
  currency: "KRW",
  fontFamily: "pretendard",
  fontSize: "m",
};

const SECTIONS: {
  id: SectionKey;
  icon: ReactNode;
  label: string;
  sub: string;
}[] = [
  { id: "profile", icon: <IconUser size={16} />, label: "프로필", sub: "이름 · 이메일 · 언어" },
  { id: "appearance", icon: <IconSparkles size={16} />, label: "테마 · 외관", sub: "다크 모드 · 색상" },
  { id: "ledger", icon: <IconWallet size={16} />, label: "가계부 설정", sub: "월급일 · 카테고리 · 통화" },
  { id: "notifications", icon: <IconBell size={16} />, label: "알림", sub: "푸시 · 이메일 · 사운드" },
  { id: "tools", icon: <IconAdjustments size={16} />, label: "도구 설정", sub: "타이머 · 메모 기본값" },
  { id: "security", icon: <IconShieldLock size={16} />, label: "보안 · 잠금", sub: "비밀번호 · 생체 인증" },
  { id: "data", icon: <IconDatabase size={16} />, label: "데이터", sub: "백업 · 내보내기 · 삭제" },
  { id: "account", icon: <IconCoin size={16} />, label: "계정 · 결제", sub: "플랜 · 청구" },
];

const useTweaks = () => {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(TWEAKS_STORAGE_KEY);
      if (raw) setTweaks({ ...DEFAULT_TWEAKS, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  const setTweak = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) =>
    setTweaks((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(TWEAKS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* noop */
        }
      }
      return next;
    });

  return [tweaks, setTweak] as const;
};

export function SettingsPage() {
  const [section, setSection] = useState<SectionKey>("profile");
  const [tweaks, setTweak] = useTweaks();

  return (
    <AuthRequiredWrapper>
      <div className="wl-page-head">
        <div>
          <div className="wl-crumb">메뉴 · 환경설정</div>
          <h1 className="wl-page-title">
            환경설정
            <span className="wl-page-title__hand">— 내 입맛에 맞게</span>
          </h1>
          <div className="wl-page-sub">변경한 항목은 자동 저장됩니다</div>
        </div>
      </div>

      <div className="wl-settings-layout">
        <aside className="wl-settings-nav">
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              className={`wl-settings-nav-item${section === s.id ? " wl-settings-nav-item--on" : ""}`}
              onClick={() => setSection(s.id)}
            >
              {s.icon}
              <div>
                <b>{s.label}</b>
                <small>{s.sub}</small>
              </div>
            </div>
          ))}
        </aside>

        <div className="wl-settings-main">
          {section === "profile" && <ProfileSection />}
          {section === "appearance" && <AppearanceSection tweaks={tweaks} setTweak={setTweak} />}
          {section === "ledger" && <LedgerSection tweaks={tweaks} setTweak={setTweak} />}
          {section === "notifications" && <NotificationsSection />}
          {section === "tools" && <ToolsSection />}
          {section === "security" && <SecuritySection />}
          {section === "data" && <DataSection />}
          {section === "account" && <AccountSection />}
        </div>
      </div>
    </AuthRequiredWrapper>
  );
}

function SettingRow({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="wl-setting-row">
      <div className="wl-setting-label">
        <b>{label}</b>
        {sub && <small>{sub}</small>}
      </div>
      <div className="wl-setting-control">{children}</div>
    </div>
  );
}

function Switch({
  on,
  onChange,
}: {
  on: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [local, setLocal] = useState(on);
  const v = onChange ? on : local;
  const toggle = () => {
    if (onChange) onChange(!on);
    else setLocal(!local);
  };
  return (
    <button
      type="button"
      className={`wl-switch${v ? " wl-switch--on" : ""}`}
      onClick={toggle}
      aria-pressed={v}
    >
      <span className="wl-switch__thumb" />
    </button>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const displayName = user?.name?.trim() || "게스트";
  const email = user?.email ?? "—";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = (user as { image?: string | null } | null)?.image ?? null;

  const [name, setName] = useState(displayName);
  const [bio, setBio] = useState("");

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  const changeLanguage = (lang: string) => {
    void i18n.changeLanguage(lang);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("i18nextLng", lang);
      } catch {
        /* noop */
      }
    }
  };

  return (
    <div className="wl-settings-group">
      <h3>프로필</h3>
      <div className="wl-profile-hero">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="wl-avatar"
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          <div
            className="wl-avatar"
            style={{ width: 64, height: 64, fontSize: 26, background: "#e89aac" }}
          >
            {initial}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 18 }}>{displayName}</b>
          <div className="wl-memo-muted" style={{ fontSize: 13 }}>
            {email} · 무료 플랜
          </div>
        </div>
        <button type="button" className="wl-timer-btn">
          사진 변경
        </button>
      </div>
      <SettingRow label="이름">
        <input
          className="wl-set-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </SettingRow>
      <SettingRow label="이메일">
        <input className="wl-set-input" value={email} readOnly />
      </SettingRow>
      <SettingRow label="자기소개" sub="대시보드 상단에 표시됩니다">
        <textarea
          className="wl-set-input"
          rows={2}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="한 줄 소개를 적어보세요."
        />
      </SettingRow>
      <SettingRow label="서비스 언어" sub="앱 전체에 적용">
        <select
          className="wl-set-input"
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </SettingRow>
      <SettingRow label="시간대">
        <select className="wl-set-input" defaultValue="seoul">
          <option value="seoul">(GMT+9) 서울</option>
          <option value="tokyo">(GMT+9) 도쿄</option>
          <option value="ny">(GMT-5) 뉴욕</option>
        </select>
      </SettingRow>
    </div>
  );
}

function AppearanceSection({
  tweaks,
  setTweak,
}: {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
}) {
  const colorScheme = useUiStore((s) => s.colorScheme);
  const setColorSchemePreference = useUiStore((s) => s.setColorSchemePreference);
  const { setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const toggleDark = (next: boolean) => {
    const value = next ? "dark" : "light";
    setColorSchemePreference(value);
    setColorScheme(value);
  };

  const accents: { id: Tweaks["accent"]; c: string; label: string }[] = [
    { id: "yellow", c: "#ffe27a", label: "노랑" },
    { id: "coral", c: "#ffb38a", label: "코랄" },
    { id: "mint", c: "#b9e7c9", label: "민트" },
    { id: "lilac", c: "#d4c1f0", label: "라일락" },
  ];

  return (
    <>
      <div className="wl-settings-group">
        <h3>테마</h3>
        <SettingRow label="다크 모드" sub="저녁 작업에 편한 어두운 테마">
          <Switch on={isDark} onChange={toggleDark} />
        </SettingRow>
        <SettingRow label="포인트 컬러" sub="브랜드 색상과 강조 요소에 적용">
          <div style={{ display: "flex", gap: 8 }}>
            {accents.map((a) => (
              <div
                key={a.id}
                className={`wl-acc-swatch${tweaks.accent === a.id ? " wl-acc-swatch--on" : ""}`}
                style={{ background: a.c }}
                onClick={() => setTweak("accent", a.id)}
                title={a.label}
              >
                {tweaks.accent === a.id && <IconCheck size={14} />}
              </div>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="달력 표시" sub="대시보드에 미니 달력 노출">
          <Switch
            on={tweaks.showCalendar}
            onChange={(v) => setTweak("showCalendar", v)}
          />
        </SettingRow>
      </div>

      <div className="wl-settings-group">
        <h3>글꼴 · 타이포그래피</h3>
        <SettingRow label="기본 글꼴">
          <select
            className="wl-set-input"
            value={tweaks.fontFamily}
            onChange={(e) =>
              setTweak("fontFamily", e.target.value as Tweaks["fontFamily"])
            }
          >
            <option value="pretendard">Pretendard</option>
            <option value="jakarta">Plus Jakarta Sans</option>
            <option value="noto">Noto Sans KR</option>
          </select>
        </SettingRow>
        <SettingRow label="글자 크기" sub="앱 전체 기준">
          <select
            className="wl-set-input"
            value={tweaks.fontSize}
            onChange={(e) =>
              setTweak("fontSize", e.target.value as Tweaks["fontSize"])
            }
          >
            <option value="s">작게</option>
            <option value="m">보통</option>
            <option value="l">크게</option>
          </select>
        </SettingRow>
      </div>
    </>
  );
}

function LedgerSection({
  tweaks,
  setTweak,
}: {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
}) {
  return (
    <>
      <div className="wl-settings-group">
        <h3>월급일 · 가계부 주기</h3>
        <SettingRow label="월급일 유형" sub="실제 입금 패턴에 맞춰 선택하세요">
          <select
            className="wl-set-input"
            value={tweaks.paydayType}
            onChange={(e) => setTweak("paydayType", e.target.value as Tweaks["paydayType"])}
          >
            <option value="fixed">매월 고정일</option>
            <option value="lastDay">매월 말일</option>
            <option value="firstDay">매월 1일</option>
            <option value="custom">사용자 지정</option>
          </select>
        </SettingRow>
        {tweaks.paydayType === "fixed" && (
          <SettingRow label="월급일 (매월)" sub="이 날짜를 기준으로 D-day와 가계부 주기가 계산돼요">
            <div className="wl-payday-pick">
              <input
                type="number"
                min={1}
                max={31}
                className="wl-set-input"
                style={{
                  minWidth: 80,
                  textAlign: "center",
                  fontFamily: "var(--wl-font-mono)",
                  fontWeight: 700,
                }}
                value={tweaks.payday}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1 && v <= 31) setTweak("payday", v);
                }}
              />
              <span style={{ fontSize: 13, color: "var(--wl-ink-soft)", fontWeight: 600 }}>
                일
              </span>
            </div>
          </SettingRow>
        )}
        <SettingRow label="가계부 주기 시작일" sub="한 달 통계의 시작점">
          <select
            className="wl-set-input"
            value={tweaks.cycleStart}
            onChange={(e) => setTweak("cycleStart", e.target.value as Tweaks["cycleStart"])}
          >
            <option value="payday">월급일 기준</option>
            <option value="1st">매월 1일</option>
            <option value="custom">사용자 지정</option>
          </select>
        </SettingRow>
        <SettingRow label="주말일 때 처리" sub="월급일이 주말/공휴일이면">
          <select className="wl-set-input" defaultValue="prev">
            <option value="prev">앞당겨서 입금</option>
            <option value="next">뒤로 미뤄서 입금</option>
            <option value="exact">그대로 표시</option>
          </select>
        </SettingRow>
      </div>

      <div className="wl-settings-group">
        <h3>예산 · 한도</h3>
        <SettingRow label="월 예산 알림" sub="예산의 80% 도달 시 알림">
          <Switch on />
        </SettingRow>
        <SettingRow label="기본 통화">
          <select
            className="wl-set-input"
            value={tweaks.currency}
            onChange={(e) => setTweak("currency", e.target.value as Tweaks["currency"])}
          >
            <option value="KRW">원 (₩)</option>
            <option value="USD">달러 ($)</option>
            <option value="JPY">엔 (¥)</option>
            <option value="EUR">유로 (€)</option>
          </select>
        </SettingRow>
        <SettingRow label="천 단위 표기" sub="₩1,000,000 vs 1백만">
          <select className="wl-set-input" defaultValue="comma">
            <option value="comma">콤마 (1,000,000)</option>
            <option value="korean">한글 (1백만)</option>
            <option value="short">단축 (1M)</option>
          </select>
        </SettingRow>
      </div>

      <div className="wl-settings-group">
        <h3>카테고리 · 자동 분류</h3>
        <SettingRow label="자동 카테고리 인식" sub="가맹점명으로 카테고리 자동 분류">
          <Switch on />
        </SettingRow>
        <SettingRow label="정기 결제 자동 등록" sub="동일 금액 반복 시 구독으로 추정">
          <Switch on />
        </SettingRow>
        <SettingRow label="카테고리 관리">
          <button type="button" className="wl-timer-btn">
            편집
          </button>
        </SettingRow>
      </div>
    </>
  );
}

function NotificationsSection() {
  return (
    <>
      <div className="wl-settings-group">
        <h3>알림</h3>
        <SettingRow label="포모도로 종료" sub="집중 / 휴식 끝났을 때 알림">
          <Switch on />
        </SettingRow>
        <SettingRow label="할 일 마감 임박" sub="마감 1시간 전 알림">
          <Switch on />
        </SettingRow>
        <SettingRow label="일정 시작 전" sub="일정 15분 전 미리 알림">
          <Switch on={false} />
        </SettingRow>
        <SettingRow label="정기 구독 결제" sub="결제 3일 전 알림">
          <Switch on />
        </SettingRow>
        <SettingRow label="이메일 요약" sub="주간 활동 요약 메일">
          <Switch on={false} />
        </SettingRow>
      </div>
      <div className="wl-settings-group">
        <h3>방해 금지 시간</h3>
        <SettingRow label="시작 시간">
          <input className="wl-set-input" type="time" defaultValue="22:00" />
        </SettingRow>
        <SettingRow label="종료 시간">
          <input className="wl-set-input" type="time" defaultValue="07:00" />
        </SettingRow>
      </div>
    </>
  );
}

function ToolsSection() {
  return (
    <>
      <div className="wl-settings-group">
        <h3>포모도로 기본값</h3>
        <SettingRow label="집중 시간 (분)">
          <input className="wl-set-input" type="number" defaultValue={25} />
        </SettingRow>
        <SettingRow label="짧은 휴식 (분)">
          <input className="wl-set-input" type="number" defaultValue={5} />
        </SettingRow>
        <SettingRow label="긴 휴식 (분)">
          <input className="wl-set-input" type="number" defaultValue={15} />
        </SettingRow>
        <SettingRow label="자동으로 다음 세션 시작">
          <Switch on={false} />
        </SettingRow>
      </div>
      <div className="wl-settings-group">
        <h3>스티커 메모</h3>
        <SettingRow label="새 메모 기본 색상">
          <select className="wl-set-input" defaultValue="yellow">
            <option value="yellow">노랑</option>
            <option value="pink">분홍</option>
            <option value="blue">파랑</option>
          </select>
        </SettingRow>
        <SettingRow label="최대 메모 개수">
          <input className="wl-set-input" type="number" defaultValue={3} />
        </SettingRow>
      </div>
    </>
  );
}

function SecuritySection() {
  return (
    <>
      <div className="wl-settings-group">
        <h3>앱 잠금</h3>
        <SettingRow label="앱 진입 시 잠금" sub="시작할 때 인증 요구">
          <Switch on={false} />
        </SettingRow>
        <SettingRow label="가계부 잠금" sub="가계부 페이지만 별도 잠금">
          <Switch on />
        </SettingRow>
        <SettingRow label="자동 잠금 시간">
          <select className="wl-set-input" defaultValue="5">
            <option value="0">즉시</option>
            <option value="1">1분 후</option>
            <option value="5">5분 후</option>
            <option value="30">30분 후</option>
          </select>
        </SettingRow>
      </div>
      <div className="wl-settings-group">
        <h3>인증</h3>
        <SettingRow label="비밀번호 변경">
          <button type="button" className="wl-timer-btn">
            변경
          </button>
        </SettingRow>
        <SettingRow label="생체 인증" sub="Face ID / 지문">
          <Switch on />
        </SettingRow>
        <SettingRow label="2단계 인증" sub="이메일 OTP">
          <Switch on={false} />
        </SettingRow>
      </div>
    </>
  );
}

function DataSection() {
  return (
    <>
      <div className="wl-settings-group">
        <h3>백업 · 내보내기</h3>
        <SettingRow label="자동 백업" sub="매일 자정 클라우드에 저장">
          <Switch on />
        </SettingRow>
        <SettingRow label="가계부 내보내기" sub="CSV / Excel 형식">
          <button type="button" className="wl-timer-btn">
            다운로드
          </button>
        </SettingRow>
        <SettingRow label="전체 데이터 내보내기" sub="JSON 형식">
          <button type="button" className="wl-timer-btn">
            다운로드
          </button>
        </SettingRow>
      </div>
      <div className="wl-settings-group wl-settings-group--danger">
        <h3>위험 구역</h3>
        <SettingRow label="모든 메모 삭제" sub="복구할 수 없습니다">
          <button type="button" className="wl-timer-btn wl-timer-btn--danger">
            삭제
          </button>
        </SettingRow>
        <SettingRow label="계정 삭제" sub="모든 데이터가 영구 삭제됩니다">
          <button type="button" className="wl-timer-btn wl-timer-btn--danger">
            계정 삭제
          </button>
        </SettingRow>
      </div>
    </>
  );
}

function AccountSection() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="wl-settings-group">
        <h3>현재 플랜</h3>
        <div className="wl-plan-card">
          <div>
            <b style={{ fontSize: 18 }}>무료 플랜</b>
            <div className="wl-memo-muted" style={{ fontSize: 12, marginTop: 4 }}>
              스티커 3개 · 기본 도구 · 광고 없음
            </div>
          </div>
          <button type="button" className="wl-timer-btn wl-timer-btn--primary">
            Pro로 업그레이드
          </button>
        </div>
        <div className="wl-plan-card wl-plan-card--pro">
          <div>
            <b style={{ fontSize: 18 }}>Pro 플랜 — ₩4,900/월</b>
            <div className="wl-memo-muted" style={{ fontSize: 12, marginTop: 4 }}>
              무제한 메모 · 클라우드 백업 · 우선 지원 · 가족 공유
            </div>
          </div>
          <span className="wl-tag">추천</span>
        </div>
      </div>

      <div className="wl-settings-group">
        <h3>세션</h3>
        <SettingRow
          label="로그인 상태"
          sub={user?.email ? `${user.email}로 로그인됨` : "게스트"}
        >
          <button
            type="button"
            className="wl-timer-btn wl-timer-btn--danger"
            onClick={handleLogout}
            disabled={isLoggingOut || !user}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <IconLogout size={14} />
            {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </SettingRow>
      </div>
    </>
  );
}
