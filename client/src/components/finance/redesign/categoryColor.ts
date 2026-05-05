// 시안 기준 카테고리 색상 매핑. DB 개편 후엔 실제 category.color 필드로 대체.
export const CATEGORY_COLOR: Record<string, string> = {
  식비: "#e89aac",
  외식: "#e25c4d",
  주거: "#1f1d18",
  교통: "#8ec0d6",
  쇼핑: "#e8c84a",
  여가: "#a8d09b",
  구독: "#a259ff",
  건강: "#4a8d5a",
  도서: "#2c5e8b",
  급여: "#4a8d5a",
  부수입: "#4a8d5a",
  환불: "#4a8d5a",
  기타: "#c9bd9f",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#8a8479";
}
