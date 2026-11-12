import assert from 'node:assert/strict';
import test from 'node:test';
import { SignJWT } from 'jose';
import { createSessionToken, verifySessionToken } from '../lib/session-token';

test('signed sessions reject raw IDs, tampering, expiry and a different signing key', async () => {
  process.env.SESSION_SECRET = 'a'.repeat(64);
  const token = await createSessionToken('user-fixture');
  assert.equal(await verifySessionToken(token), 'user-fixture');
  assert.equal(await verifySessionToken('user-fixture'), null);
  assert.equal(await verifySessionToken(undefined), null);
  const parts = token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ sub: 'other-user' })).toString('base64url');
  assert.equal(await verifySessionToken(parts.join('.')), null);
  const expired = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' })
    .setSubject('user-fixture').setIssuer('barbershop-queue').setAudience('barbershop-dashboard')
    .setExpirationTime(1).sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  assert.equal(await verifySessionToken(expired), null);
  process.env.SESSION_SECRET = 'b'.repeat(64);
  assert.equal(await verifySessionToken(token), null);
  delete process.env.SESSION_SECRET;
  assert.equal(await verifySessionToken(token), null);
  await assert.rejects(createSessionToken('user-fixture'));
});
