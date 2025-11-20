import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AspectPresetId,
  CropHistoryItem,
  ImageCropSettings,
} from "@/types/imageCrop";

interface ImageCropState {
  settings: ImageCropSettings;
  history: CropHistoryItem[];
  setSettings: (settings: Partial<ImageCropSettings>) => void;
  setAspectPreset: (
    aspectPresetId: AspectPresetId,
    customAspect?: ImageCropSettings["customAspect"]
  ) => void;
  addHistory: (item: CropHistoryItem) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

const DEFAULT_SETTINGS: ImageCropSettings = {
  aspectPresetId: "free",
  format: "png",
  quality: 0.92,
  transparentBackground: true,
};

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage(() => window.localStorage);

export const useImageCropStore = create<ImageCropState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      history: [],

      setSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),

      setAspectPreset: (aspectPresetId, customAspect) =>
        set((state) => ({
          settings: {
            ...state.settings,
            aspectPresetId,
            customAspect:
              aspectPresetId === "custom" ? customAspect : undefined,
          },
        })),

      addHistory: (item) =>
        set((state) => {
          const nextHistory = [item, ...state.history].slice(0, 5);
          return { history: nextHistory };
        }),

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "image-crop-store",
      version: 1,
      storage,
      partialize: (state) => ({
        settings: state.settings,
        history: state.history,
      }),
    }
  )
);
