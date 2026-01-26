/**
 * GRID SYSTEM: The Golden Ratio
 * 1 Foot = 32 Pixels
 * 
 * [PLUGIN REPLICA]
 * This utility is the Sovereign Source of Truth for all spatial calculations.
 * It maps D&D Size Categories to Pixel Dimensions and Cell Footprints.
 */

export const PIXELS_PER_FOOT = 32;

// Immutable registry of size categories
export const SIZE_REGISTRY = Object.freeze({
    tiny: { feet: 1, text: 'Tiny (2ft space)' }, 
    small: { feet: 1, text: 'Small (5ft space)' },
    medium: { feet: 1, text: 'Medium (5ft space)' },
    large: { feet: 2, text: 'Large (10ft space)' },
    huge: { feet: 3, text: 'Huge (15ft space)' },
    gargantuan: { feet: 4, text: 'Gargantuan (20ft space)' }
} as const);

export type SizeCategory = keyof typeof SIZE_REGISTRY;

export function getPixelDimensions(size: string | null | undefined): number {
    if (!size) return PIXELS_PER_FOOT; // Default Medium

    const normalized = size.toLowerCase() as SizeCategory;
    const config = SIZE_REGISTRY[normalized];

    if (!config) return PIXELS_PER_FOOT; // Default Medium

    return config.feet * PIXELS_PER_FOOT;
}

export function getCellFootprint(size: string | null | undefined): number {
    if (!size) return 1;

    const normalized = size.toLowerCase() as SizeCategory;
    const config = SIZE_REGISTRY[normalized];

    if (!config) return 1;

    return config.feet;
}

export function validateMatrixSize(matrix: unknown[], size: string): boolean {
    if (!Array.isArray(matrix)) return false;
    const target = getPixelDimensions(size);
    // Check row count
    if (matrix.length !== target) return false;
    // Check first row (assuming uniform)
    if (Array.isArray(matrix[0]) && matrix[0].length !== target) return false;
    
    return true;
}
