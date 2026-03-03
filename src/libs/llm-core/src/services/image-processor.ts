import Jimp from 'jimp';

export class ImageProcessor {
  /**
   * Processes a base64 Image string to match the user's React Canvas POC math exactly:
   * 1. Resizes to targetSize x targetSize with pixelated interpolation (Nearest Neighbor).
   * 2. Reads pixels and isolates the background color from [0,0].
   * 3. Removes background (tolerance 45, or white > 235).
   * 4. Quantizes remaining pixels to 4-bit RGBA (mapped modulo 17 logic).
   * @returns processed Base64 PNG.
   */
  static async processImage(base64: string, targetSize: number): Promise<string> {
    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const image = await Jimp.read(buffer);

    // 1. Resize (Nearest Neighbor is critical for pixel art retention)
    image.resize(targetSize, targetSize, Jimp.RESIZE_NEAREST_NEIGHBOR);

    // 2. Sample Top-Left Pixel for Background Color
    const bgHex = image.getPixelColor(0, 0); // Returns RGBA hex integer
    const bgInfo = Jimp.intToRGBA(bgHex);
    const bgR = bgInfo.r;
    const bgG = bgInfo.g;
    const bgB = bgInfo.b;

    const tolerance = 45;

    // 3 & 4. Scan, Remove BG, Quantize
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      const isBg =
        (Math.abs(r - bgR) <= tolerance &&
         Math.abs(g - bgG) <= tolerance &&
         Math.abs(b - bgB) <= tolerance) ||
        (r > 235 && g > 235 && b > 235);

      if (isBg) {
        this.bitmap.data[idx + 0] = 0;
        this.bitmap.data[idx + 1] = 0;
        this.bitmap.data[idx + 2] = 0;
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (Transparent)
      } else {
        // Quantize to #RGBA (4 bits per channel, 0-15 mapped to 0-255) via modulo 17 logic from POC
        this.bitmap.data[idx + 0] = Math.round(r / 17) * 17;
        this.bitmap.data[idx + 1] = Math.round(g / 17) * 17;
        this.bitmap.data[idx + 2] = Math.round(b / 17) * 17;
        this.bitmap.data[idx + 3] = Math.round(this.bitmap.data[idx + 3] / 17) * 17;
      }
    });

    const outBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return `data:image/png;base64,${outBuffer.toString('base64')}`;
  }

  /**
   * Translates a finalized `base64` image perfectly back into a 2D Array of RGBA Hex Strings.
   * This is explicitly critical so we do not break backwards compatibility with the Map Explorer components.
   * Map Exploer expects: [["#RRGGBBAA", "transparent", ...], [...]]
   */
  static async toHexArray(base64: string, size: number): Promise<string[][]> {
    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const image = await Jimp.read(buffer);

    const grid: string[][] = [];
    const toHex = (n: number) => n.toString(16).padStart(2, '0');

    for (let y = 0; y < size; y++) {
      const row: string[] = [];
      for (let x = 0; x < size; x++) {
        // Read precise pixel at x, y
        const hexInt = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hexInt);

        if (rgba.a === 0) {
          row.push('transparent');
        } else {
          // Serialize directly to generic RGBA format so UI canvas elements can drop it in as `ctx.fillStyle`
          row.push(`#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(rgba.a)}`.toUpperCase());
        }
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Converts a 2D Array of RGBA Hex Strings into a Base64 PNG.
   * This is used to feed existing Text-Grid Blueprints back into Gemini's Vision context as silhouettes.
   */
  static async hexArrayToPng(grid: string[][]): Promise<string> {
    const width = grid[0]?.length || 32;
    const height = grid.length || 32;

    const image = await Jimp.create(width, height, 0x00000000); // Transparent bg

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = grid[y]?.[x];
        if (color && color !== 'transparent' && color !== 'none') {
          // Parse #RRGGBB or #RRGGBBAA to integer
          const hexStr = color.replace(/^#/, '');
          let intVal = 0;
          if (hexStr.length === 6) {
            intVal = parseInt(hexStr + 'FF', 16);
          } else if (hexStr.length === 8) {
            intVal = parseInt(hexStr, 16);
          }
          if (intVal) {
             image.setPixelColor(intVal, x, y);
          }
        }
      }
    }

    const outBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return `data:image/png;base64,${outBuffer.toString('base64')}`;
  }
}
