// 공통 오디오 유틸 — 모바일/Safari 자동재생 차단 대응을 위한 AudioContext unlock
// 사용자 제스처(클릭) 안에서 unlockAudio()를 호출해두면, 이후 setInterval 등
// 백그라운드 콜백에서도 playTone()이 정상 재생됩니다.

let audioContext: AudioContext | null = null;

function getOrCreateContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioContext = new Ctor();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/**
 * 사용자 제스처 안에서 호출 — AudioContext를 활성화해 이후 사운드 재생을 보장.
 */
export function unlockAudio(): void {
  const ctx = getOrCreateContext();
  if (ctx?.state === "suspended") {
    ctx.resume().catch(() => {
      // 제스처 외부 resume 실패는 무시
    });
  }
}

/**
 * 짧은 사인파 톤 재생. 자산(mp3) 없이 동작.
 */
export function playTone(frequency: number, duration = 0.35): void {
  const ctx = getOrCreateContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.05);
}

/**
 * 두 음 시퀀스 — 완료음으로 사용.
 */
export function playCompletionChime(volume = 1): void {
  const base = 0.35 * Math.max(0, Math.min(1, volume));
  playTone(520, base);
  setTimeout(() => playTone(660, base), 220);
}
