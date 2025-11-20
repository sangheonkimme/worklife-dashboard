import { IconCrop, IconFileTypePdf, IconHourglassHigh } from "@tabler/icons-react";
import type { WidgetConfig } from "@/types/widget";
import {
  ImageCropWidget,
  ImageToPdfWidget,
  TimerWidget,
} from "@/components/widgets";

/**
 * Registered widgets
 * Add new widgets by appending to this array.
 */
export const WIDGETS: WidgetConfig[] = [
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    nameKey: "registry.imageToPdf.name",
    icon: IconFileTypePdf,
    description: "Convert multiple images into a single PDF file.",
    descriptionKey: "registry.imageToPdf.description",
    component: ImageToPdfWidget,
    displayMode: "modal",
    modalSize: "xl",
    color: "blue",
    order: 1,
    enabled: true,
  },
  {
    id: "image-crop",
    name: "Image cropper",
    nameKey: "registry.imageCrop.name",
    icon: IconCrop,
    description: "Crop, resize, and export images without leaving the dashboard.",
    descriptionKey: "registry.imageCrop.description",
    component: ImageCropWidget,
    displayMode: "modal",
    modalSize: "xl",
    color: "cyan",
    order: 2,
    enabled: true,
  },
  {
    id: "timer",
    name: "Timer",
    nameKey: "registry.timer.name",
    icon: IconHourglassHigh,
    description: "Set any duration and start a countdown.",
    descriptionKey: "registry.timer.description",
    component: TimerWidget,
    displayMode: "modal",
    modalSize: "lg",
    color: "teal",
    order: 3,
    enabled: true,
  },
];

/**
 * Find a widget by id
 */
export const getWidgetById = (id: string): WidgetConfig | undefined => {
  return WIDGETS.find((widget) => widget.id === id);
};

/**
 * Return only enabled widgets
 */
export const getEnabledWidgets = (): WidgetConfig[] => {
  return WIDGETS.filter((widget) => widget.enabled).sort(
    (a, b) => a.order - b.order
  );
};
