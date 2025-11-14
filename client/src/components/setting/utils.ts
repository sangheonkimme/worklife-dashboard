export const minutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

export const millisecondsToMinutes = (milliseconds: number) =>
  Math.round(milliseconds / 1000 / 60);

export const minutesToSeconds = (minutes: number) => minutes * 60;

export const secondsToMinutes = (seconds: number) => Math.round(seconds / 60);

export const hoursToMilliseconds = (hours: number) => hours * 60 * 60 * 1000;

export const MAX_TIMER_DURATION_MS = hoursToMilliseconds(24);
