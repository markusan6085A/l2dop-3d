import jwt from 'jsonwebtoken';

const ISS = 'l2dop-3d';

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('JWT_SECRET must be set and at least 16 characters');
  }
  return s;
}

export function signAccessToken(userId: string): string {
  // TODO(prod-auth): скоротити до 10–30 хв після впровадження HttpOnly refresh cookie.
  return jwt.sign({ sub: userId }, secret(), {
    expiresIn: '7d',
    issuer: ISS,
  });
}

export function verifyAccessToken(token: string): { sub: string } {
  const decoded = jwt.verify(token, secret(), { issuer: ISS });
  if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded)) {
    throw new Error('Invalid token payload');
  }
  const sub = (decoded as { sub?: unknown }).sub;
  if (typeof sub !== 'string' || !sub) {
    throw new Error('Invalid token subject');
  }
  return { sub };
}
