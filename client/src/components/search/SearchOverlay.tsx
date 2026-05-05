"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconHome,
  IconWallet,
  IconCash,
  IconRepeat,
  IconCalendar,
  IconNotes,
  IconCalculator,
  IconCrop,
  IconFileTypePdf,
  IconSettings,
  IconCurrencyWon,
} from "@tabler/icons-react";

type EntryType = "page";

interface SearchEntry {
  type: EntryType;
  href: string;
  label: string;
  sub: string;
  icon: ReactNode;
  keywords?: string[];
}

const ENTRIES: SearchEntry[] = [
  { type: "page", href: "/dashboard", label: "대시보드", sub: "오늘의 한눈에", icon: <IconHome size={14} />, keywords: ["dashboard", "home"] },
  { type: "page", href: "/dashboard/expense", label: "가계부", sub: "수입 · 지출 · 통계", icon: <IconWallet size={14} />, keywords: ["ledger", "money"] },
  { type: "page", href: "/dashboard/txns", label: "거래내역", sub: "전체 검색 · 상세", icon: <IconCash size={14} />, keywords: ["transactions", "txns"] },
  { type: "page", href: "/dashboard/subscriptions", label: "정기구독", sub: "구독 관리", icon: <IconRepeat size={14} />, keywords: ["subs", "subscriptions"] },
  { type: "page", href: "/dashboard/calendar", label: "캘린더", sub: "일정 · 이벤트", icon: <IconCalendar size={14} />, keywords: ["calendar", "schedule"] },
  { type: "page", href: "/dashboard/notes", label: "메모", sub: "장문 메모", icon: <IconNotes size={14} />, keywords: ["memo", "notes"] },
  { type: "page", href: "/dashboard/salary", label: "연봉 계산기", sub: "실수령액 계산", icon: <IconCalculator size={14} />, keywords: ["salary", "tax"] },
  { type: "page", href: "/dashboard/loan", label: "대출 이자 계산기", sub: "원리금/원금 균등", icon: <IconCash size={14} />, keywords: ["loan", "interest"] },
  { type: "page", href: "/dashboard/finance-tools", label: "급여 계산기", sub: "주급 · 시급", icon: <IconCurrencyWon size={14} />, keywords: ["wage", "hourly"] },
  { type: "page", href: "/tools/image-crop", label: "이미지 자르기", sub: "비율 · 크롭", icon: <IconCrop size={14} />, keywords: ["crop", "image"] },
  { type: "page", href: "/tools/image-to-pdf", label: "이미지 → PDF", sub: "한번에 변환", icon: <IconFileTypePdf size={14} />, keywords: ["pdf", "convert"] },
  { type: "page", href: "/dashboard/settings", label: "환경설정", sub: "테마 · 계정", icon: <IconSettings size={14} />, keywords: ["settings", "preferences"] },
];

const TYPE_LABELS: Record<EntryType, string> = { page: "페이지" };

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIndex(0);
      // 다음 프레임에 포커스 (모달 마운트 후)
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return ENTRIES.slice(0, 6);
    return ENTRIES.filter((it) => {
      const hay = (it.label + " " + it.sub + " " + (it.keywords?.join(" ") ?? "")).toLowerCase();
      return hay.includes(ql);
    });
  }, [q]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const target = filtered[activeIndex];
        if (target) {
          router.push(target.href);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, filtered, activeIndex, router]);

  if (!open) return null;

  const grouped = filtered.reduce<Record<EntryType, SearchEntry[]>>(
    (acc, it) => {
      if (!acc[it.type]) acc[it.type] = [];
      acc[it.type].push(it);
      return acc;
    },
    {} as Record<EntryType, SearchEntry[]>
  );

  const handlePick = (entry: SearchEntry) => {
    router.push(entry.href);
    onClose();
  };

  let runningIndex = 0;

  return (
    <div className="wl-search-overlay" onClick={onClose} role="presentation">
      <div
        className="wl-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="검색"
      >
        <div className="wl-search-input-wrap">
          <IconSearch size={18} />
          <input
            ref={inputRef}
            placeholder="페이지, 거래, 일정, 메모 검색…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd>ESC</kbd>
        </div>

        <div className="wl-search-results">
          {filtered.length === 0 ? (
            <div className="wl-search-empty">
              <div className="wl-search-empty__mark">🔍</div>
              <b>검색 결과가 없어요</b>
              <small>다른 키워드로 시도해보세요</small>
            </div>
          ) : (
            (Object.keys(grouped) as EntryType[]).map((type) => (
              <div key={type} className="wl-search-group">
                <div className="wl-search-group__label">
                  {q.trim() ? TYPE_LABELS[type] : "바로가기"}
                </div>
                {grouped[type].map((it) => {
                  const idx = runningIndex++;
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={it.href}
                      className={`wl-search-item${isActive ? " wl-search-item--active" : ""}`}
                      onClick={() => handlePick(it)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="wl-search-item__ico">{it.icon}</div>
                      <div className="wl-search-item__body">
                        <b>{it.label}</b>
                        <small>{it.sub}</small>
                      </div>
                      <span className="wl-search-item__type">{TYPE_LABELS[it.type]}</span>
                      <span className="wl-search-item__arrow">↵</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="wl-search-foot">
          <span>
            <kbd>↵</kbd> 이동
          </span>
          <span>
            <kbd>↑↓</kbd> 선택
          </span>
          <span>
            <kbd>ESC</kbd> 닫기
          </span>
          <span className="wl-search-foot__tip">⌘K로 다시 열기</span>
        </div>
      </div>
    </div>
  );
}
