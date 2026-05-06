// Phase 2 시안용 mock 데이터. DB 개편 후 실제 API와 어댑터 함수로 교체.

export interface MockTxn {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  label: string;
  note: string;
  amount: number; // 음수=지출, 양수=수입
  type: "in" | "out";
  icon: "coffee" | "wallet" | "cash" | "home" | "zap" | "repeat" | "sparkle";
  cat: string;
  pay: string;
  memo: string;
}

export const MOCK_TXNS: MockTxn[] = [
  { id: 1, date: "2026-05-05", time: "14:32", label: "스타벅스 강남R점", note: "라떼 + 샌드위치", amount: -12300, type: "out", icon: "coffee", cat: "식비", pay: "신한카드", memo: "팀원과 1:1" },
  { id: 2, date: "2026-05-05", time: "12:10", label: "GS25", note: "음료수, 간식", amount: -4800, type: "out", icon: "wallet", cat: "식비", pay: "현대카드", memo: "" },
  { id: 3, date: "2026-05-05", time: "09:00", label: "월급 입금", note: "(주)디자인하우스 5월", amount: 3650000, type: "in", icon: "cash", cat: "급여", pay: "신한 입금", memo: "정기 급여" },
  { id: 4, date: "2026-05-04", time: "23:14", label: "택시", note: "심야할증", amount: -18400, type: "out", icon: "zap", cat: "교통", pay: "신한카드", memo: "회식 후 귀가" },
  { id: 5, date: "2026-05-04", time: "20:42", label: "한식주점 도담", note: "팀 회식 N빵", amount: -42000, type: "out", icon: "wallet", cat: "외식", pay: "신한카드", memo: "5명 워크샵" },
  { id: 6, date: "2026-05-04", time: "10:00", label: "월세", note: "정기 자동이체", amount: -850000, type: "out", icon: "home", cat: "주거", pay: "자동이체", memo: "5월분" },
  { id: 7, date: "2026-05-04", time: "08:00", label: "헬스장", note: "5월 정기결제", amount: -89000, type: "out", icon: "repeat", cat: "건강", pay: "자동이체", memo: "" },
  { id: 8, date: "2026-05-03", time: "22:11", label: "넷플릭스", note: "프리미엄 구독", amount: -17000, type: "out", icon: "repeat", cat: "구독", pay: "신한카드", memo: "" },
  { id: 9, date: "2026-05-03", time: "19:48", label: "이마트", note: "장보기 · 식료품", amount: -78400, type: "out", icon: "wallet", cat: "식비", pay: "현대카드", memo: "주말 장보기" },
  { id: 10, date: "2026-05-03", time: "15:32", label: "프리랜서 수익", note: "디자인 프로젝트 · A사", amount: 450000, type: "in", icon: "sparkle", cat: "부수입", pay: "토스 입금", memo: "5월 1차" },
  { id: 11, date: "2026-05-02", time: "11:24", label: "스타벅스 R 청담", note: "아이스 아메리카노", amount: -4900, type: "out", icon: "coffee", cat: "식비", pay: "신한카드", memo: "" },
  { id: 12, date: "2026-05-02", time: "10:00", label: "ChatGPT Plus", note: "정기 구독", amount: -28000, type: "out", icon: "repeat", cat: "구독", pay: "현대카드", memo: "" },
  { id: 13, date: "2026-05-01", time: "21:08", label: "쿠팡", note: "생필품 · 무료배송", amount: -34500, type: "out", icon: "wallet", cat: "쇼핑", pay: "신한카드", memo: "휴지, 세제" },
  { id: 14, date: "2026-05-01", time: "13:50", label: "김밥천국", note: "점심", amount: -8500, type: "out", icon: "wallet", cat: "식비", pay: "현금", memo: "" },
  { id: 15, date: "2026-04-30", time: "18:22", label: "올리브영", note: "스킨케어", amount: -56700, type: "out", icon: "wallet", cat: "쇼핑", pay: "신한카드", memo: "" },
  { id: 16, date: "2026-04-30", time: "08:30", label: "지하철", note: "교통카드 충전", amount: -50000, type: "out", icon: "zap", cat: "교통", pay: "신한카드", memo: "" },
  { id: 17, date: "2026-04-29", time: "20:00", label: "CGV 왕십리", note: "영화 + 팝콘", amount: -28000, type: "out", icon: "sparkle", cat: "여가", pay: "현대카드", memo: "친구와" },
  { id: 18, date: "2026-04-29", time: "12:00", label: "무신사", note: "봄 셔츠 1벌", amount: -64000, type: "out", icon: "wallet", cat: "쇼핑", pay: "현대카드", memo: "" },
  { id: 19, date: "2026-04-28", time: "16:00", label: "친구 빌려준 돈", note: "민지에게", amount: -50000, type: "out", icon: "cash", cat: "기타", pay: "토스 송금", memo: "5월 말 갚기로" },
  { id: 20, date: "2026-04-28", time: "09:30", label: "병원", note: "감기 진료비", amount: -8500, type: "out", icon: "wallet", cat: "건강", pay: "현금", memo: "" },
  { id: 21, date: "2026-04-27", time: "14:00", label: "환불 — 무신사", note: "사이즈 안 맞음", amount: 32000, type: "in", icon: "repeat", cat: "환불", pay: "신한 입금", memo: "" },
  { id: 22, date: "2026-04-26", time: "19:18", label: "교보문고", note: "책 2권", amount: -32400, type: "out", icon: "wallet", cat: "도서", pay: "신한카드", memo: "디자인 책" },
];

export const MOCK_MONTHLY = [
  { in: 60, out: 42 },
  { in: 55, out: 38 },
  { in: 65, out: 50 },
  { in: 58, out: 45 },
  { in: 70, out: 48 },
  { in: 62, out: 52 },
  { in: 68, out: 40 },
  { in: 72, out: 58 },
  { in: 65, out: 47 },
  { in: 78, out: 60 },
  { in: 82, out: 55 },
];

export const MOCK_MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
];

import {
  IconCoffee,
  IconWallet,
  IconCash,
  IconHome,
  IconBolt,
  IconRepeat,
  IconSparkles,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type IconType = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

export const ICON_MAP: Record<MockTxn["icon"], IconType> = {
  coffee: IconCoffee,
  wallet: IconWallet,
  cash: IconCash,
  home: IconHome,
  zap: IconBolt,
  repeat: IconRepeat,
  sparkle: IconSparkles,
};
