import { IconFileTypePdf } from "@tabler/icons-react";
import type { WidgetConfig } from "@/types/widget";
import { ImageToPdfWidget } from "@/components/widgets/ImageToPdfWidget";

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
  // 추가 위젯은 여기에 등록
  // {
  //   id: 'quick-memo',
  //   name: '빠른 메모',
  //   icon: IconNotes,
  //   description: '빠르게 메모를 작성합니다',
  //   component: QuickMemoWidget,
  //   displayMode: 'modal',
  //   modalSize: 'md',
  //   color: 'green',
  //   order: 2,
  //   enabled: true,
  // },
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
