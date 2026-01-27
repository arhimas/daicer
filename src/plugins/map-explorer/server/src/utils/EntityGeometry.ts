
export enum EntitySize {
  Fine = 'Fine',
  Diminutive = 'Diminutive',
  Tiny = 'Tiny',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Huge = 'Huge',
  Gargantuan = 'Gargantuan',
  Colossal = 'Colossal',
}

export const PIXELS_PER_FOOT = 32;

export const EntitySpaceFeet: Record<EntitySize, number> = {
  [EntitySize.Fine]: 0.5,
  [EntitySize.Diminutive]: 1,
  [EntitySize.Tiny]: 2.5,
  [EntitySize.Small]: 5,
  [EntitySize.Medium]: 5,
  [EntitySize.Large]: 10,
  [EntitySize.Huge]: 15,
  [EntitySize.Gargantuan]: 20,
  [EntitySize.Colossal]: 30, // 30+ actually
};

export const EntityGeometry = {
  /**
   * Returns the pixel dimensions (width/height) for a given size category.
   * Assumes square aspect ratio for the base footprint.
   */
  getPixelDimensions(size: string | EntitySize): { width: number; height: number } {
    const spaceFeet = EntitySpaceFeet[size as EntitySize] || EntitySpaceFeet[EntitySize.Medium];
    const pixels = Math.ceil(spaceFeet * PIXELS_PER_FOOT);
    return { width: pixels, height: pixels };
  },

  /**
   * Returns the number of grid cells (1ft x 1ft) occupied by the entity.
   * Since cells are 1ft, this is purely spaceFeet^2 for area, or spaceFeet for linear dimension.
   */
  getGridOccupancy(size: string | EntitySize): number {
    const spaceFeet = EntitySpaceFeet[size as EntitySize] || EntitySpaceFeet[EntitySize.Medium];
    return Math.ceil(spaceFeet);
  },

  /**
   * Helper to validate if a size string is a valid EntitySize
   */
  isValidSize(size: string): size is EntitySize {
    return Object.values(EntitySize).includes(size as EntitySize);
  }
};
