// 스티커 메모 타입 정의
export interface StickyNote {
  id: string;
  content: string;
  color: string;
  position: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 스티커 메모 생성 DTO
export interface CreateStickyNoteDto {
  content?: string;
  color?: string;
  position?: number;
}

// 스티커 메모 수정 DTO
export interface UpdateStickyNoteDto {
  content?: string;
  color?: string;
  position?: number;
}

// 스티커 메모 색상 상수
export const STICKY_NOTE_COLORS = {
  YELLOW: '#FFF9C4',
  PINK: '#FCE4EC',
  BLUE: '#E1F5FE',
  MINT: '#E0F2F1',
} as const;

export const STICKY_NOTE_COLOR_ARRAY = Object.values(STICKY_NOTE_COLORS);
