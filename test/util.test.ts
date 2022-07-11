import { ensureHex } from '../src/util';

describe('util', () => {
  /**
   * @deprecated
   */
  describe('ensureHex', () => {
    it('returns the same value if it is already hex of correct length.', () => {
      expect(ensureHex('deadbeef', 8)).toBe('deadbeef');
    });

    it('generates a left-padded hex from input string is correct length but not hex.', () => {
      expect(ensureHex('testhexx', 8)).toBe('68657878');
    });

    it('generates a left-padded hex from input string is too short.', () => {
      expect(ensureHex('beef', 16)).toBe('0000000062656566');
    });
  });
});
