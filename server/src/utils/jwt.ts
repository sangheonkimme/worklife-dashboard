import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET: Secret =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN: string =
  process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * 액세스 토큰을 생성합니다
 * @param payload 토큰에 포함될 데이터
 * @returns JWT 액세스 토큰
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  const options = { expiresIn: JWT_EXPIRES_IN } as SignOptions;
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * 리프레시 토큰을 생성합니다
 * @param payload 토큰에 포함될 데이터
 * @returns JWT 리프레시 토큰
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const options = { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions;
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * 액세스 토큰을 검증합니다
 * @param token JWT 토큰
 * @returns 디코딩된 페이로드
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

/**
 * 리프레시 토큰을 검증합니다
 * @param token JWT 리프레시 토큰
 * @returns 디코딩된 페이로드
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};
