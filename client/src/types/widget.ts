// 위젯 관련 타입 정의

import type { Icon } from "@tabler/icons-react";

// ========================================
// 위젯 독 시스템 타입
// ========================================

export interface WidgetConfig {
  id: string;
  name: string;
  icon: Icon;
  description: string;
  component: React.ComponentType<WidgetProps>;
  displayMode: "modal" | "page" | "inline";
  modalSize?: "sm" | "md" | "lg" | "xl" | "full";
  color: string;
  order: number;
  enabled: boolean;
}

export interface WidgetProps {
  onClose?: () => void;
}

// ========================================
// PDF 변환 위젯 타입
// ========================================

export interface PdfOptions {
  pageSize: "A4" | "Letter" | "Custom";
  orientation: "portrait" | "landscape";
  imageFit: "fit" | "fill" | "original";
  margin?: number;
  customWidth?: number;
  customHeight?: number;
}

export interface ImageFile {
  file: File;
  id: string;
  preview: string; // Object URL
  order: number;
}

export interface PdfGenerationResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  fileName?: string;
}

// 페이지 크기 상수 (포인트 단위, 1pt = 1/72 inch)
export const PAGE_SIZES = {
  A4: {
    width: 595.28,
    height: 841.89,
  },
  Letter: {
    width: 612,
    height: 792,
  },
} as const;

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  pageSize: "A4",
  orientation: "portrait",
  imageFit: "fit",
  margin: 20,
};
