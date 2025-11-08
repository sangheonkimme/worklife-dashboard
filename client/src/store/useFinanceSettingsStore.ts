import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FinanceSettingsState {
  payday: number;
  setPayday: (day: number) => void;
}

const clampPayday = (day: number) => {
  if (Number.isNaN(day)) return 1;
  return Math.min(31, Math.max(1, Math.round(day)));
};

export const useFinanceSettingsStore = create<FinanceSettingsState>()(
  persist(
    (set) => ({
      payday: 1,
      setPayday: (day: number) => set({ payday: clampPayday(day) }),
    }),
    {
      name: "finance-settings",
      version: 1,
    }
  )
);
