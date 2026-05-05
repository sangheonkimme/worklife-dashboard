// Phase 2 시안용 mock 데이터. DB 개편 후 Supabase 어댑터로 교체.

export type SubStatus = "active" | "paused";
export type SubCycle = "월" | "년";

export interface MockSub {
  id: number;
  name: string;
  cat: string;
  price: number;
  cycle: SubCycle;
  next: string;
  day: number;
  color: string;
  initial: string;
  status: SubStatus;
  started: string;
}

export const MOCK_SUBS: MockSub[] = [
  { id: 1, name: "Netflix", cat: "엔터테인먼트", price: 17000, cycle: "월", next: "11.07", day: 7, color: "#e25c4d", initial: "N", status: "active", started: "2023.05" },
  { id: 2, name: "Spotify", cat: "음악", price: 13900, cycle: "월", next: "11.12", day: 12, color: "#4a8d5a", initial: "S", status: "active", started: "2022.11" },
  { id: 3, name: "Adobe CC", cat: "업무 도구", price: 24000, cycle: "월", next: "11.15", day: 15, color: "#ee5a3d", initial: "Ai", status: "active", started: "2024.01" },
  { id: 4, name: "Figma Pro", cat: "업무 도구", price: 18500, cycle: "월", next: "11.21", day: 21, color: "#a259ff", initial: "F", status: "active", started: "2023.09" },
  { id: 5, name: "iCloud+ 200GB", cat: "클라우드", price: 3300, cycle: "월", next: "11.03", day: 3, color: "#3a8dde", initial: "iC", status: "active", started: "2021.04" },
  { id: 6, name: "쿠팡 와우", cat: "쇼핑", price: 7890, cycle: "월", next: "11.08", day: 8, color: "#e8c84a", initial: "쿠", status: "active", started: "2022.06" },
  { id: 7, name: "왓챠", cat: "엔터테인먼트", price: 12900, cycle: "월", next: "11.18", day: 18, color: "#e89aac", initial: "W", status: "paused", started: "2024.06" },
  { id: 8, name: "ChatGPT Plus", cat: "업무 도구", price: 28000, cycle: "월", next: "11.25", day: 25, color: "#1a1a1a", initial: "G", status: "active", started: "2024.03" },
  { id: 9, name: "노션 패밀리", cat: "업무 도구", price: 12000, cycle: "월", next: "11.06", day: 6, color: "#000000", initial: "N", status: "active", started: "2023.02" },
  { id: 10, name: "교보문고 sam", cat: "독서", price: 9900, cycle: "월", next: "11.14", day: 14, color: "#2c5e8b", initial: "사", status: "active", started: "2024.07" },
  { id: 11, name: "헬스장", cat: "건강", price: 89000, cycle: "월", next: "11.01", day: 1, color: "#a8d09b", initial: "헬", status: "active", started: "2025.04" },
  { id: 12, name: "도메인 갱신", cat: "기타", price: 22000, cycle: "년", next: "26.04", day: 4, color: "#c9bd9f", initial: "D", status: "active", started: "2020.04" },
];

export const SUB_CATS: { id: string; label: string; color: string }[] = [
  { id: "all", label: "전체", color: "var(--wl-ink)" },
  { id: "업무 도구", label: "업무 도구", color: "#a259ff" },
  { id: "엔터테인먼트", label: "엔터테인먼트", color: "#e25c4d" },
  { id: "음악", label: "음악", color: "#4a8d5a" },
  { id: "클라우드", label: "클라우드", color: "#3a8dde" },
  { id: "쇼핑", label: "쇼핑", color: "#e8c84a" },
  { id: "독서", label: "독서", color: "#2c5e8b" },
  { id: "건강", label: "건강", color: "#a8d09b" },
  { id: "기타", label: "기타", color: "#c9bd9f" },
];
