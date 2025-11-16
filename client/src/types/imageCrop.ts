export type CropFormat = "png" | "jpeg" | "webp";

export type AspectPresetId =
  | "free"
  | "1:1"
  | "4:3"
  | "16:9"
  | "9:16"
  | "4:5"
  | "custom";

export interface CustomAspectRatio {
  width: number;
  height: number;
}

export interface ImageCropSettings {
  aspectPresetId: AspectPresetId;
  customAspect?: CustomAspectRatio;
  format: CropFormat;
  quality: number; // 0-1
  transparentBackground: boolean;
}

export interface CropHistoryItem {
  id: string;
  createdAt: number;
  dataUrl: string;
  width: number;
  height: number;
  format: CropFormat;
  fileName: string;
}
