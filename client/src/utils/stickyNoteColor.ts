import { STICKY_NOTE_COLORS } from "@/types/stickyNote";

// 기존 hex 컬러 → 리디자인 variant 매핑
export type StickyVariant = "yellow" | "pink" | "blue" | "mint";

const HEX_TO_VARIANT: Record<string, StickyVariant> = {
  [STICKY_NOTE_COLORS.YELLOW.toUpperCase()]: "yellow",
  [STICKY_NOTE_COLORS.PINK.toUpperCase()]: "pink",
  [STICKY_NOTE_COLORS.BLUE.toUpperCase()]: "blue",
  [STICKY_NOTE_COLORS.MINT.toUpperCase()]: "mint",
};

export function getStickyVariant(color: string): StickyVariant {
  return HEX_TO_VARIANT[color.toUpperCase()] ?? "yellow";
}
