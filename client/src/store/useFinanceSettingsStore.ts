import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FinanceSettings } from "@/types/userSettings";

interface FinanceSettingsState {
  payday: number;
  currency: string;
  weekStartsOn: number;
  setPayday: (day: number) => void;
  setCurrency: (currency: string) => void;
  setWeekStartsOn: (day: number) => void;
  hydrateFromUserSettings: (settings: FinanceSettings) => void;
}

const clampPayday = (day: number) => {
  if (Number.isNaN(day)) return 1;
  return Math.min(31, Math.max(1, Math.round(day)));
};

const clampWeekday = (value: number) => {
  if (Number.isNaN(value)) return 1;
  return Math.min(6, Math.max(0, Math.round(value)));
};

export const useFinanceSettingsStore = create<FinanceSettingsState>()(
  persist(
    (set) => ({
      payday: 1,
      currency: "KRW",
      weekStartsOn: 1,
      setPayday: (day: number) => set({ payday: clampPayday(day) }),
      setCurrency: (currency) => set({ currency }),
      setWeekStartsOn: (day) => set({ weekStartsOn: clampWeekday(day) }),
      hydrateFromUserSettings: (settings) =>
        set(() => ({
          payday: clampPayday(settings.payday),
          currency: settings.currency,
          weekStartsOn: clampWeekday(settings.weekStartsOn),
        })),
    }),
    {
      name: "finance-settings",
      version: 1,
      partialize: (state) => ({
        payday: state.payday,
        currency: state.currency,
        weekStartsOn: state.weekStartsOn,
      }),
    }
  )
);
