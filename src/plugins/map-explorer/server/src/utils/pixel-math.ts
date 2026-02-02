/**
 * SOTA Pixel Math Kernel
 * Handles Color Parsing, Normalization, and Alpha Blending.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number; // 0-255
}

export function parseColor(color: string | null | undefined): RGBA {
  if (!color || color === 'transparent' || color === 'none') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  if (color.startsWith('#')) {
    const hex = color.substring(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 255,
      };
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 255,
      };
    }
  }

  if (color.startsWith('rgba')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 4) {
      return {
        r: parseInt(parts[0], 10),
        g: parseInt(parts[1], 10),
        b: parseInt(parts[2], 10),
        a: Math.floor(parseFloat(parts[3]) * 255),
      };
    }
  }

  if (color.startsWith('rgb')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return {
        r: parseInt(parts[0], 10),
        g: parseInt(parts[1], 10),
        b: parseInt(parts[2], 10),
        a: 255,
      };
    }
  }

  // Fallback black opaque (or should it be transparent?)
  // SOTA: Fail safe to black opaque for debugging, or transparent?
  // Let's go with opaque black for specific invalid strings, but transparent for empty.
  return { r: 0, g: 0, b: 0, a: 255 };
}

export function rgbaToString(c: RGBA): string {
  if (c.a === 0) return 'transparent'; // Canonical transparent
  if (c.a === 255) {
    // Optim: Return Hex if fully opaque
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
  }
  // Return rgba string for semi-transparent
  const aNorm = Number((c.a / 255).toFixed(3)); // 3 decimals precision
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${aNorm})`;
}

export function blendPixels(bgStr: string, fgStr: string): string {
  const fg = parseColor(fgStr);

  // Optimization: If FG is fully opaque, it just overwrites
  if (fg.a === 255) return fgStr;
  // Optimization: If FG is fully transparent, nothing happens
  if (fg.a === 0) return bgStr;

  const bg = parseColor(bgStr);

  // Alpha Blending: src-over
  // outA = srcA + dstA * (1 - srcA)
  // outC = (srcC * srcA + dstC * dstA * (1 - srcA)) / outA

  const alphaSrc = fg.a / 255;
  const alphaDst = bg.a / 255;
  const alphaOut = alphaSrc + alphaDst * (1 - alphaSrc);

  if (alphaOut === 0) return 'transparent';

  const rOut = Math.round((fg.r * alphaSrc + bg.r * alphaDst * (1 - alphaSrc)) / alphaOut);
  const gOut = Math.round((fg.g * alphaSrc + bg.g * alphaDst * (1 - alphaSrc)) / alphaOut);
  const bOut = Math.round((fg.b * alphaSrc + bg.b * alphaDst * (1 - alphaSrc)) / alphaOut);
  const aOut = Math.round(alphaOut * 255);

  return rgbaToString({ r: rOut, g: gOut, b: bOut, a: aOut });
}
