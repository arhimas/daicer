import { RoomRuneGenerator, generateRoomRune } from '@daicer/shared/utils/room-rune-generator';

describe('Room Rune Generator', () => {
  const generator = new RoomRuneGenerator();

  it('should encode and decode correctly', () => {
    const id = 123456;
    const rune = generator.encode(id);
    const decoded = generator.decode(rune);
    expect(decoded).toBe(id);
  });

  it('should result in exactly 6 characters', () => {
    const id = 1;
    const rune = generator.encode(id);
    expect(rune.length).toBe(6);
  });

  it('should handle sequential IDs with different runes', () => {
    const rune1 = generator.encode(1);
    const rune2 = generator.encode(2);
    expect(rune1).not.toBe(rune2);
  });

  it('should handle zero', () => {
    const rune = generator.encode(0);
    expect(generator.decode(rune)).toBe(0);
    expect(rune.length).toBe(6);
  });

  it('should throw for invalid characters during decode', () => {
    expect(() => generator.decode('!@#$%^')).toThrow();
  });

  it('should handle case insensitivity', () => {
    const id = 999;
    const rune = generator.encode(id).toUpperCase();
    expect(generator.decode(rune)).toBe(id);
  });

  it('generateRoomRune helper should return string', () => {
    const rune = generateRoomRune();
    expect(typeof rune).toBe('string');
    expect(rune.length).toBe(6);
  });
});
