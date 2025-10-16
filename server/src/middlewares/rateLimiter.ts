import rateLimit from 'express-rate-limit';

// 일반 API 요청 제한
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 요청 제한 (더 엄격)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5개 요청
  message: {
    status: 'error',
    message: '너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
