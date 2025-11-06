/**
 * 시간 포맷팅 유틸리티
 */

/**
 * 밀리초를 HH:MM:SS.mmm 또는 MM:SS.mm 형식으로 변환
 * @param milliseconds - 밀리초
 * @returns 포맷된 시간 문자열
 */
export const formatTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = Math.floor((milliseconds % 1000) / 10); // 10ms 단위 (2자리)

  if (hours > 0) {
    // 1시간 이상: HH:MM:SS.mm
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(2, '0')}`;
  }

  // 1시간 미만: MM:SS.mm
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * 밀리초를 MM:SS 형식으로 변환 (간소화된 포맷)
 * @param milliseconds - 밀리초
 * @returns 포맷된 시간 문자열
 */
export const formatTimeSimple = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * 밀리초를 HH:MM:SS 형식으로 변환 (밀리초 제외)
 * @param milliseconds - 밀리초
 * @returns 포맷된 시간 문자열
 */
export const formatTimeNoMs = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};
