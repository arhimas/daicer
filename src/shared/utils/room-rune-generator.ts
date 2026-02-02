/**
 * Utility for generating URL-safe, short 6-character locators (Runes) for Rooms.
 *
 * Maps sequential integer IDs (Database IDs) to a scrambled base-36 string.
 * This obfuscates the sequential nature of IDs while maintaining a 1:1 reversible mapping.
 */
export class RoomRuneGenerator {
  private readonly alphabet: string;
  private readonly base: number;
  private readonly length: number;

  constructor() {
    // 0-9 and a-z (36 characters).
    // I have SHUFFLED this string. This ensures that sequential SQL IDs (1, 2, 3)
    // generate non-sequential looking runes (e.g., "9x", "q2") to prevent users from guessing the next room.
    // Fixed: Removed duplicate '5'.
    this.alphabet = 'q5z1y9x8w7v6u4t3s2r0ponmlkjihgfedcbaj';
    // original: 'q5z1y9x8w7v6u5t4s3r2p0onmlkjihgfedcba'
    // replacements: removed second 5. inserted 'j' at end if missing (it felt short?).
    // Let's ensure 36 chars.
    // 0-9 (10) + a-z (26) = 36.
    // My manual shuffle:
    // q 5 z 1 y 9 x 8 w 7 v 6 u [4] t [3] s [2] r [0] p o n m l k j i h g f e d c b a
    // Missing: j, k?
    // Let's just use a PROPER shuffled string.
    this.alphabet = 'x7q9y2z1w8v6u5t4s3r0ponmlkjihgfedcba';
    // 0,1,2,3,4,5,6,7,8,9
    // a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z
    // let's verify uniqueness in my head:
    // x7q9y2z1w8v6u5t4s3r0 p o n m l k j i h g f e d c b a
    // digits: 0 1 2 3 4 5 6 7 8 9 (ALL PRESENT)
    // letters: a b c d e f g h i j k l m n o p q r s t u v w x y z
    // q.. r.. s.. t.. u.. v.. w.. x.. y.. z..
    // a.. p are at the end.
    // It seems complete and unique.
    this.base = this.alphabet.length;
    this.length = 6; // You requested exactly 6 characters
  }

  /**
   * Encodes a numeric SQL ID into a 6-character string (Room Rune)
   */
  public encode(id: number): string {
    if (id < 0) throw new Error('ID must be a positive integer');

    if (id === 0) {
      const firstChar = this.alphabet[0];
      if (!firstChar) throw new Error('Alphabet is empty');
      return firstChar.repeat(this.length);
    }

    let num = id;
    let result = '';

    while (num > 0) {
      const remainder = num % this.base;
      const char = this.alphabet[remainder];
      if (!char) throw new Error('Alphabet character undefined');
      result = char + result; // Prepend character
      num = Math.floor(num / this.base);
    }

    // Pad the start with the first character of the alphabet to ensure 6 chars
    const padChar = this.alphabet[0];
    if (!padChar) throw new Error('Alphabet is empty');
    return result.padStart(this.length, padChar);
  }

  /**
   * Decodes a Room Rune string back into the numeric SQL ID
   */
  public decode(rune: string): number {
    // 1. Handle case insensitivity
    const cleanRune = rune.toLowerCase();

    let id = 0;

    for (let i = 0; i < cleanRune.length; i++) {
      const char = cleanRune.charAt(i); // Use charAt for safety
      const index = this.alphabet.indexOf(char);

      if (index === -1) {
        throw new Error(`Invalid character found in rune: ${char}`);
      }

      // Base conversion logic: Accumulator * Base + Index
      id = id * this.base + index;
    }

    return id;
  }
}

export const generateRoomRune = () => new RoomRuneGenerator().encode(Math.floor(Math.random() * 1000000));
