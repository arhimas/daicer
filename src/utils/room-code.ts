/**
 * Room code generation utilities
 * Implements a Bijective Affine Cipher for Integer <-> Code mapping.
 * 
 * Logic:
 * Encode(x) = (x * PRIME + OFFSET) % MODULUS
 * Decode(y) = ((y - OFFSET) * INVERSE) % MODULUS
 * 
 * ALPHABET = 0-9, A-Z (36 chars)
 * CODE_LENGTH = 6
 * MODULUS = 36^6 = 2,176,782,336
 */

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LENGTH = BigInt(ALPHABET.length); // 36
const CODE_LENGTH = 6;
const MODULUS = ALPHABET_LENGTH ** BigInt(CODE_LENGTH); // 2,176,782,336

// Parameters for the affine transformation: (x * PRIME + OFFSET) % MODULUS
// PRIME must be coprime to MODULUS (36^6 = 2^12 * 3^12). 
// 920419823 is prime and not divisible by 2 or 3.
const PRIME = BigInt(920419823);

// Modular Inverse of PRIME modulo MODULUS, calculated via Extended Euclidean Algorithm.
// Inverse(920419823, 2176782336) = 663310607
const PRIME_INVERSE = BigInt(663310607);

// OFFSET can be arbitrary. Half modulus provides good scramble.
const OFFSET = MODULUS / BigInt(2); // 1,088,391,168

/**
 * Encodes a sequential integer ID into a 6-character alphanumeric room code.
 * 
 * @param id - The sequential ID (e.g., from database). Must be < MODULUS.
 * @returns A 6-char code (e.g., "7XK92A").
 */
export function generateRoomCode(id: number | bigint): string {
  const x = BigInt(id);
  
  // Ensure x is within bounds
  if (x >= MODULUS) {
      throw new Error(`ID ${id} exceeds maximum room code capacity (${MODULUS})`);
  }

  // 1. Affine Transformation
  const obfuscated = (x * PRIME + OFFSET) % MODULUS;

  // 2. Base36 Encoding
  let code = '';
  let temp = obfuscated;

  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = temp % ALPHABET_LENGTH;
    code = ALPHABET[Number(index)] + code;
    temp /= ALPHABET_LENGTH;
  }

  return code;
}

/**
 * Decodes a 6-character room code back into its original integer ID.
 * 
 * @param code - The 6-char room code.
 * @returns The original integer ID, or -1 if invalid.
 */
export function decodeRoomCode(code: string): number {
  if (!isValidRoomCode(code)) return -1;

  // 1. Base36 Decoding
  let obfuscated = BigInt(0);
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const val = BigInt(ALPHABET.indexOf(char));
    obfuscated = obfuscated * ALPHABET_LENGTH + val;
  }

  // 2. Inverse Affine Transformation
  // x = ((y - OFFSET) * INVERSE) % MODULUS
  // Handle negative modulo correctly in JS
  let diff = obfuscated - OFFSET;
  while (diff < 0) diff += MODULUS;
  
  const id = (diff * PRIME_INVERSE) % MODULUS;

  return Number(id);
}

/**
 * Validates format of a room code.
 * Must be exactly 6 uppercase alphanumeric characters.
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
