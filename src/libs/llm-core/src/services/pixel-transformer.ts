/**
 * Pixel Forge V2: ASCII + RGBA4444 Hex Transformer
 * Enforces D&D Sizing (Padding/Cropping) and parses compressed LLM payloads.
 */

export interface PaletteMap {
  [char: string]: string; // e.g. "a": "f00f"
}

export class PixelTransformer {
  /**
   * Converts 4-bit RGBA (e.g., "f00f") to standard 8-bit Hex (e.g., "#ff0000ff").
   * Fallbacks to transparent if invalid or if mapping to standard D&D empty space.
   */
  static parseRGBA4444(hex: string): string {
    if (!hex || typeof hex !== 'string') return 'transparent';
    if (hex.toLowerCase() === 'transparent' || hex === 'none') return 'transparent';
    
    // Remove hash if present
    const cleanHex = hex.replace('#', '');
    
    // If it's already a full 6 or 8 character hex, return it standardized
    if (cleanHex.length === 6 || cleanHex.length === 8) {
      return `#${cleanHex.toUpperCase()}`;
    }

    // Must be exactly 4 characters for RGBA4444
    if (cleanHex.length !== 4) return 'transparent';

    const [r, g, b, a] = cleanHex.split('');
    const fullHex = `#${r}${r}${g}${g}${b}${b}${a}${a}`.toUpperCase();
    
    return fullHex;
  }

  /**
   * Translates an array of ASCII strings into a 2D array of Hex Colors based on the palette map.
   * If an ASCII char is missing from the palette, it is mapped to 'transparent' (Hallucination Fallback).
   */
  static mapAsciiToColors(asciiGrid: string[], palette: PaletteMap): string[][] {
    if (!asciiGrid || !Array.isArray(asciiGrid)) return [];

    return asciiGrid.map(row => {
      // split string into chars
      const chars = typeof row === 'string' ? row.split('') : [];
      return chars.map(char => {
        if (char === '.' || char === ' ') return 'transparent'; // Standard empty space mapping
        
        const mappedHex = palette[char];
        if (!mappedHex) return 'transparent'; // Hallucination fallback
        
        return this.parseRGBA4444(mappedHex);
      });
    });
  }

  /**
   * Enforces strict squared boundaries on the pixel grid.
   * Crops symmetrically from all sides if too large.
   * Pads symmetrically from all sides if too small (center-anchoring).
   */
  static enforceSquaredness(grid: string[][], targetSize: number): string[][] {
    if (!grid || grid.length === 0) {
      return Array(targetSize).fill(Array(targetSize).fill('transparent'));
    }

    const currentHeight = grid.length;
    const currentWidth = Math.max(...grid.map(row => row.length));

    // Calculate vertical offset for centering
    const yOffset = Math.floor((targetSize - currentHeight) / 2);
    // Calculate horizontal offset for centering
    const xOffset = Math.floor((targetSize - currentWidth) / 2);

    const squaredGrid: string[][] = [];

    for (let y = 0; y < targetSize; y++) {
      const newRow: string[] = [];
      const sourceY = y - yOffset;

      for (let x = 0; x < targetSize; x++) {
        const sourceX = x - xOffset;

        // Check if within bounds of the original grid
        if (
          sourceY >= 0 && sourceY < currentHeight &&
          sourceX >= 0 && sourceX < (grid[sourceY]?.length || 0)
        ) {
          newRow.push(grid[sourceY][sourceX] || 'transparent');
        } else {
          // Out of bounds (either padded or cropped section)
          newRow.push('transparent');
        }
      }
      squaredGrid.push(newRow);
    }

    return squaredGrid;
  }

  /**
   * Main execution pipeline for V2 LLM JSON output.
   * 1. Resolves JSON structure (throws if malformed per Plan instructions).
   * 2. Maps ASCII to Colors using Palette.
   * 3. Enforces squaring/cropping/padding based on Target Size.
   */
  static processAndSquareSprite(
    payload: { asciiGrid: string[], palette: PaletteMap },
    targetSize: number
  ): string[][] {
    if (!payload || !payload.asciiGrid || !payload.palette) {
      throw new Error("Invalid payload: Missing asciiGrid or palette for Pixel Forge V2.");
    }

    const coloredGrid = this.mapAsciiToColors(payload.asciiGrid, payload.palette);
    return this.enforceSquaredness(coloredGrid, targetSize);
  }
}
