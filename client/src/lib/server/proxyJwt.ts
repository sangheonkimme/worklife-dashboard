import "server-only";
import { SignJWT } from "jose";

const PROXY_JWT_TTL_SECONDS = 60;

const getSecret = () => {
  const secret = process.env.PROXY_JWT_SECRET;
  if (!secret) {
    throw new Error("PROXY_JWT_SECRET 환경변수가 설정되지 않았습니다");
  }
  return new TextEncoder().encode(secret);
};

/**
 * 짧은 TTL 의 HS256 JWT 를 발급. Next.js Route Handler 에서 Express 로 호출 시 Bearer 로 전달.
 */
export const signProxyJwt = async (payload: {
  userId: string;
  email?: string;
}) => {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PROXY_JWT_TTL_SECONDS}s`)
    .sign(getSecret());
};
