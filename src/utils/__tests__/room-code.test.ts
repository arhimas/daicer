import { describe, it, expect } from 'vitest';
import { generateRoomCode, decodeRoomCode, isValidRoomCode } from '@/utils/room-code';

describe('Room Code Utils', () => {
  describe('generateRoomCode', () => {
    it('should generate 6-character code', () => {
      const code = generateRoomCode(12345);
      expect(code).toHaveLength(6);
    });

    it('should be deterministic', () => {
      const c1 = generateRoomCode(999);
      const c2 = generateRoomCode(999);
      expect(c1).toBe(c2);
    });

    it('should change with input', () => {
      const c1 = generateRoomCode(1);
      const c2 = generateRoomCode(2);
      expect(c1).not.toBe(c2);
    });

    it('should produce alphanumeric uppercase', () => {
      const code = generateRoomCode(1000000);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });
  });

  describe('decodeRoomCode', () => {
    it('should reverse generateRoomCode (Bijective property)', () => {
      const ids = [1, 2, 100, 99999, 12345678, 1000000000];
      ids.forEach((id) => {
        const code = generateRoomCode(id);
        const decoded = decodeRoomCode(code);
        expect(decoded).toBe(id);
      });
    });

    it('should return -1 for invalid code format', () => {
      expect(decodeRoomCode('INVALID')).toBe(-1);
      expect(decodeRoomCode('abc123')).toBe(-1);
    });
  });

  describe('isValidRoomCode', () => {
    it('should return true for valid codes', () => {
      expect(isValidRoomCode('ABC123')).toBe(true);
      expect(isValidRoomCode('000000')).toBe(true);
      expect(isValidRoomCode('ZZZZZZ')).toBe(true);
    });

    it('should return false for invalid length', () => {
      expect(isValidRoomCode('ABC')).toBe(false);
      expect(isValidRoomCode('ABC1234')).toBe(false);
    });

    it('should return false for invalid chars', () => {
      expect(isValidRoomCode('abc123')).toBe(false); // lowercase
      expect(isValidRoomCode('ABC-12')).toBe(false);
    });
  });
});
