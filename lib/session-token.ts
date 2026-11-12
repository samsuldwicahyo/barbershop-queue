import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'bs_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const ISSUER = 'barbershop-queue';
const AUDIENCE = 'barbershop-dashboard';

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Set SESSION_SECRET to a random value of at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionKey());
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE,
    });
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}
