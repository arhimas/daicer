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

// 32x32 pixels per 5ft square (Standard D&D / Pixel Art Scale)
// Means 1ft = 6.4 pixels.
// Fine (0.5ft) -> 3.2px (round to 4 or 8)
// Tiny (2.5ft) -> 16px
// Small (5ft) -> 32px
// Medium (5ft) -> 32px
// Large (10ft) -> 64px
// Huge (15ft) -> 96px
// Gargantuan (20ft) -> 128px
// Colossal (30ft) -> 192px

export const PIXELS_PER_FOOT = 6.4; // Was 32, which resulted in Medium=160px (too big for JSON)

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
  },

  /**
   * Run-Length Encoding (RLE) to minimize grid storage.
   * Format: "count" + "x" + "color".
   * Special Case: "transparent" -> "T".
   * Example: ["transparent", "transparent", "red"] -> ["2xT", "1xred"]
   */
  compressRow(row: string[]): string[] {
    const compressed: string[] = [];
    if (!row || row.length === 0) return compressed;

    let currentColor = row[0];
    let count = 0;

    for (const color of row) {
      if (color === currentColor) {
        count++;
      } else {
        const code = currentColor === 'transparent' ? 'T' : currentColor;
        compressed.push(`${count}x${code}`);
        currentColor = color;
        count = 1;
      }
    }
    // Push last segment
    const code = currentColor === 'transparent' ? 'T' : currentColor;
    compressed.push(`${count}x${code}`);

    return compressed;
  },

  decompressRow(compressedRow: string[]): string[] {
    const row: string[] = [];
    for (const segment of compressedRow) {
      const [countStr, ...colorParts] = segment.split('x');
      const count = parseInt(countStr, 10);
      let color = colorParts.join('x'); // Rejoin if color had 'x' (rare but safe)

      if (color === 'T') color = 'transparent';

      for (let i = 0; i < count; i++) {
        row.push(color);
      }
    }
    return row;
  },

  compressGrid(grid: string[][]): string[][] {
    return grid.map((row) => this.compressRow(row));
  },

  decompressGrid(grid: string[][]): string[][] {
    return grid.map((row) => this.decompressRow(row));
  },
};
