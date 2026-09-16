/* eslint-disable no-bitwise -- required by the RFC 4122 v4 version/variant bits */
// RFC 4122 version 4 UUID generator using crypto.getRandomValues. Hermes does
// not expose globalThis.crypto on device (verified on RN 0.77.3/Hermes 0.18),
// so index.js loads the react-native-get-random-values polyfill first. Jest
// provides it via a polyfill in jest.setup.js. Deliberately fails loudly
// instead of falling back to a weak entropy source.
function fillRandom(bytes: Uint8Array): void {
  const getRandomValues = globalThis.crypto?.getRandomValues;
  if (typeof getRandomValues !== 'function') {
    throw new Error('crypto.getRandomValues is not available on this runtime');
  }
  getRandomValues.call(globalThis.crypto, bytes);
}

export function createId(): string {
  const bytes = new Uint8Array(16);
  fillRandom(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
