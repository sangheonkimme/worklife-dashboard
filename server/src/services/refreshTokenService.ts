import crypto from 'crypto';
import { prisma } from '../lib/prisma';
const DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_MAX_AGE_MS = Number(process.env.JWT_REFRESH_EXPIRES_IN_MS) || DEFAULT_REFRESH_MAX_AGE_MS;

export type RefreshSessionStatus =
  | 'VALID'
  | 'EXPIRED'
  | 'REVOKED'
  | 'INVALID';

export interface RefreshSessionValidation {
  status: RefreshSessionStatus;
  userId?: string;
  sessionId?: string;
}

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateToken = () => crypto.randomBytes(32).toString('hex');

const buildRefreshToken = (sessionId: string, rawToken: string) => `${sessionId}.${rawToken}`;

const parseRefreshToken = (raw: string) => {
  const [sessionId, token] = raw.split('.');
  if (!sessionId || !token) {
    throw new Error('INVALID_REFRESH_TOKEN_FORMAT');
  }
  return { sessionId, token };
};

export const createRefreshSession = async (params: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const session = await prisma.refreshSession.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE_MS),
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    },
  });

  return {
    session,
    refreshToken: buildRefreshToken(session.id, rawToken),
  };
};

export const revokeSessionById = async (sessionId: string) => {
  await prisma.refreshSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllSessionsForUser = async (userId: string) => {
  await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const validateRefreshToken = async (rawToken: string): Promise<RefreshSessionValidation> => {
  try {
    const { sessionId, token } = parseRefreshToken(rawToken);
    const session = await prisma.refreshSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      return { status: 'INVALID' };
    }

    if (session.revokedAt) {
      return { status: 'REVOKED', userId: session.userId, sessionId };
    }

    const now = new Date();
    if (session.expiresAt.getTime() <= now.getTime()) {
      return { status: 'EXPIRED', userId: session.userId, sessionId };
    }

    const isMatch = hashToken(token) === session.tokenHash;
    if (!isMatch) {
      return { status: 'INVALID', userId: session.userId, sessionId };
    }

    return { status: 'VALID', userId: session.userId, sessionId };
  } catch (error) {
    return { status: 'INVALID' };
  }
};

export const rotateRefreshSession = async (rawToken: string, context?: { ipAddress?: string | null; userAgent?: string | null }) => {
  const { sessionId, token } = parseRefreshToken(rawToken);
  const session = await prisma.refreshSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('REFRESH_SESSION_NOT_FOUND');
  }

  if (session.revokedAt) {
    throw new Error('REFRESH_SESSION_REVOKED');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new Error('REFRESH_SESSION_EXPIRED');
  }

  const isMatch = hashToken(token) === session.tokenHash;
  if (!isMatch) {
    throw new Error('REFRESH_TOKEN_MISMATCH');
  }

  await revokeSessionById(sessionId);

  const { session: newSession, refreshToken: newRefreshToken } = await createRefreshSession({
    userId: session.userId,
    ipAddress: context?.ipAddress || null,
    userAgent: context?.userAgent || null,
  });

  return {
    previousSession: session,
    session: newSession,
    refreshToken: newRefreshToken,
  };
};
