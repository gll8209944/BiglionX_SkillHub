/**
 * 自签 Session JWT（用于 GitHub 等非 OIDC Provider）
 *
 * 与 NvwaX JWT 的区别：
 * - 算法：HS256（对称密钥）vs RS256（非对称密钥）
 * - 签发方：SkillHub 自身 vs NvwaX IdP
 * - 验证方式：SESSION_SECRET vs JWKS
 *
 * Cookie 中存的是同一个 skillhub_access_token，
 * middleware 和 auth() 通过尝试两种验证方式来区分来源。
 */

import { SignJWT, jwtVerify } from 'jose';

const SESSION_ISSUER = 'skillhub-self';
const SESSION_AUDIENCE = 'skillhub-web';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天，与 NvwaX session 一致

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionJWTPayload {
  sub: string;       // User ID (Prisma)
  email: string;
  name: string;
  picture: string | null;
  provider: string;  // 'github' | 'google' | ...
}

/**
 * 签发自签 Session JWT
 */
export async function signSessionToken(payload: SessionJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSessionSecret());
}

/**
 * 验证自签 Session JWT
 * 如果不是自签 JWT 或验证失败，返回 null（不抛异常）
 */
export async function verifySessionToken(token: string): Promise<SessionJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionJWTPayload;
  } catch {
    return null;
  }
}
