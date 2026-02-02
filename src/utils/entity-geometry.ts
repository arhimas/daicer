/**
 * GRID SYSTEM: The Golden Ratio
 * 1 Foot = 32 Pixels
 *
 * This utility is the Sovereign Source of Truth for all spatial calculations.
 * It maps D&D Size Categories to Pixel Dimensions and Cell Footprints.
 */

export const PIXELS_PER_FOOT = 32;

// Immutable registry of size categories
// slug: The internal ID used in DB and Code
// feet: The diameter in world-feet (determines cell occupancy)
// pixels: The calculated pixel diameter (feet * 32)
export const SIZE_REGISTRY = Object.freeze({
  tiny: { feet: 1, text: 'Tiny (2ft space)' }, // Treated as 1 cell for mechanical simplicity, but sub-cell visually
  small: { feet: 1, text: 'Small (5ft space)' },
  medium: { feet: 1, text: 'Medium (5ft space)' },
  large: { feet: 2, text: 'Large (10ft space)' },
  huge: { feet: 3, text: 'Huge (15ft space)' },
  gargantuan: { feet: 4, text: 'Gargantuan (20ft space)' },
} as const);

export type SizeCategory = keyof typeof SIZE_REGISTRY;

/**
 * Returns the pixel diameter for a given size category.
 * Defaults to 'medium' (32px) if input is invalid.
 *
 * @param size - The size slug (e.g., 'large', 'tiny')
 * @returns number - The dimension in pixels (e.g., 64)
 */
export function getPixelDimensions(size: string | null | undefined): number {
  if (!size) return PIXELS_PER_FOOT; // Default Medium

  const normalized = size.toLowerCase() as SizeCategory;
  const config = SIZE_REGISTRY[normalized];

  if (!config) return PIXELS_PER_FOOT; // Default Medium

  return config.feet * PIXELS_PER_FOOT;
}

/**
 * Returns the number of cells this entity occupies along one axis.
 * e.g., Large (2ft) -> 2 cells wide (occupying 2x2 = 4 cells total).
 *
 * @param size - The size slug
 * @returns number - The cell count (e.g., 2)
 */
export function getCellFootprint(size: string | null | undefined): number {
  if (!size) return 1;

  const normalized = size.toLowerCase() as SizeCategory;
  const config = SIZE_REGISTRY[normalized];

  if (!config) return 1;

  return config.feet;
}

/**
 * Helper to check if a matrix matches the expected dimensions for a given size.
 */
export function validateMatrixSize(matrix: unknown[], size: string): boolean {
  if (!Array.isArray(matrix)) return false;
  const target = getPixelDimensions(size);
  // Check row count
  if (matrix.length !== target) return false;
  // Check first row (assuming uniform)
  if (Array.isArray(matrix[0]) && matrix[0].length !== target) return false;

  return true;
}
