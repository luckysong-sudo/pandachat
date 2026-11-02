import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveKeyFromSecret,
  encryptPayload,
  decryptPayload,
  generateRandomBytes,
  generateSafetyFingerprint,
  computeSha256
} from './e2ee.ts';

test('E2EE key derivation and roundtrip encryption/decryption works', async () => {
  const salt = generateRandomBytes(16);
  const secret = 'saber-super-secret-passphrase-2026';
  const key = await deriveKeyFromSecret(secret, salt);

  const payload = {
    messageId: 'test-123',
    text: 'Hello Saber-Chat E2EE zero-backdoor messaging!',
    timestamp: Date.now()
  };

  const sender = {
    name: 'CipherPilot',
    avatar: '🛡️',
    fingerprint: 'fp_test_123'
  };

  const envelope = await encryptPayload(payload, key, salt, sender);

  assert.ok(envelope.ciphertext.length > 0);
  assert.ok(envelope.iv.length > 0);
  assert.ok(typeof envelope.wasmHash === 'number');

  // Decrypt with correct key
  const decrypted = await decryptPayload<typeof payload>(envelope, key);
  assert.equal(decrypted.text, payload.text);
  assert.equal(decrypted.messageId, payload.messageId);
});

test('E2EE decryption fails with incorrect password or wrong key', async () => {
  const salt = generateRandomBytes(16);
  const key1 = await deriveKeyFromSecret('password-A', salt);
  const key2 = await deriveKeyFromSecret('password-B', salt);

  const payload = { text: 'Top secret data' };
  const sender = { name: 'Alice', avatar: '🐱', fingerprint: 'fp_alice' };
  const envelope = await encryptPayload(payload, key1, salt, sender);

  await assert.rejects(
    async () => {
      await decryptPayload(envelope, key2);
    },
    /AES-GCM Decryption Failed/
  );
});

test('E2EE detects ciphertext tampering via Wasm checksum and auth tag', async () => {
  const salt = generateRandomBytes(16);
  const key = await deriveKeyFromSecret('my-secret-key', salt);
  const payload = { secret: 'original' };
  const sender = { name: 'Bob', avatar: '🦁', fingerprint: 'fp_bob' };

  const envelope = await encryptPayload(payload, key, salt, sender);

  // Alter 1 character in ciphertext
  const tamperedCiphertext = envelope.ciphertext.slice(0, -4) + 'AAAA';
  const tamperedEnvelope = { ...envelope, ciphertext: tamperedCiphertext };

  await assert.rejects(
    async () => {
      await decryptPayload(tamperedEnvelope, key);
    },
    /WASM Integrity Check Failed|AES-GCM Decryption Failed/
  );
});

test('generateSafetyFingerprint returns 60-character formatted security numbers', async () => {
  const fp1 = await generateSafetyFingerprint('room_alpha_saber_secret_material');
  const fp2 = await generateSafetyFingerprint('room_alpha_saber_secret_material');
  const fp3 = await generateSafetyFingerprint('room_beta_other_material');

  assert.equal(fp1, fp2);
  assert.notEqual(fp1, fp3);
  // 12 groups of 5 digits separated by spaces = 12 * 5 + 11 = 71 chars
  const groups = fp1.split(' ');
  assert.equal(groups.length, 12);
  groups.forEach(g => assert.equal(g.length, 5));
});

test('computeSha256 generates consistent 64-character hex digests', async () => {
  const hash = await computeSha256('Saber-Chat-v2');
  assert.equal(hash.length, 64);
});
