export type TimerStatus = "idle" | "running" | "paused" | "finished";

export interface TimerSettings {
  presets: number[];
  autoRepeat: boolean;
  preAlertMs: number | null;
  notifications: boolean;
  soundEnabled: boolean;
}
