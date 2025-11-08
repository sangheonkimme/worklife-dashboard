import { IconFileTypePdf, IconHourglassHigh } from "@tabler/icons-react";
import type { WidgetConfig } from "@/types/widget";
import {
  ImageToPdfWidget,
  TimerWidget,
} from "@/components/widgets";

/**
 * 등록된 모든 위젯 목록
 * 새로운 위젯을 추가하려면 이 배열에 추가하세요.
 */
export const WIDGETS: WidgetConfig[] = [
  {
    id: "image-to-pdf",
    name: "이미지 → PDF",
    icon: IconFileTypePdf,
    description: "여러 이미지를 하나의 PDF 파일로 변환합니다",
    component: ImageToPdfWidget,
    displayMode: "modal",
    modalSize: "xl",
    color: "blue",
    order: 1,
    enabled: true,
  },
  {
    id: "timer",
    name: "타이머",
    icon: IconHourglassHigh,
    description: "자유롭게 시간을 설정하고 카운트다운을 실행합니다",
    component: TimerWidget,
    displayMode: "modal",
    modalSize: "lg",
    color: "teal",
    order: 2,
    enabled: true,
  },
];

/**
 * ID로 위젯 찾기
 */
export const getWidgetById = (id: string): WidgetConfig | undefined => {
  return WIDGETS.find((widget) => widget.id === id);
};

/**
 * 활성화된 위젯만 반환
 */
export const getEnabledWidgets = (): WidgetConfig[] => {
  return WIDGETS.filter((widget) => widget.enabled).sort(
    (a, b) => a.order - b.order
  );
};
