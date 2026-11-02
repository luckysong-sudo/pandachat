import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWasmCryptoBinary, wasmEngine } from './wasmEngine.ts';

test('WebAssembly binary bytecode header is valid', () => {
  const bytes = generateWasmCryptoBinary();
  assert.equal(bytes[0], 0x00);
  assert.equal(bytes[1], 0x61); // 'a'
  assert.equal(bytes[2], 0x73); // 's'
  assert.equal(bytes[3], 0x6d); // 'm'
  assert.equal(bytes[4], 0x01); // version 1
  assert.ok(bytes.length > 50);
});

test('wasmEngine initializes successfully and provides status', () => {
  const status = wasmEngine.getStatus();
  assert.equal(status.isSupported, true);
  assert.equal(status.isReady, true);
  assert.equal(status.memoryPages, 1);
});

test('wasmEngine fastHash produces deterministic 32-bit hashes', () => {
  const encoder = new TextEncoder();
  const data1 = encoder.encode('saber-chat-e2ee-packet-1');
  const data2 = encoder.encode('saber-chat-e2ee-packet-1');
  const data3 = encoder.encode('saber-chat-e2ee-packet-2');

  const hash1 = wasmEngine.fastHash(data1);
  const hash2 = wasmEngine.fastHash(data2);
  const hash3 = wasmEngine.fastHash(data3);

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.ok(typeof hash1 === 'number');
});

test('wasmEngine xorStream invertible byte transformation', () => {
  const encoder = new TextEncoder();
  const original = encoder.encode('Secret Saber Message 12345');
  const keyByte = 0x5a;

  const transformed = wasmEngine.xorStream(original, keyByte);
  assert.notDeepEqual(transformed, original);

  // Invert
  const restored = wasmEngine.xorStream(transformed, keyByte);
  assert.deepEqual(restored, original);
});

test('wasmEngine benchmark executes and returns performance metrics', () => {
  const bench = wasmEngine.runBenchmark(50000);
  assert.equal(bench.rounds, 50000);
  assert.ok(bench.wasmTimeMs >= 0);
  assert.ok(bench.wasmOpsSec > 0);
});
