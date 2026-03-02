const fs = require('fs');
const { PNG } = require('pngjs');

/**
 * Converts a PNG image to an array of Hex strings (e.g. #FF0000 or #00000000)
 * @param {string} filePath - Absolute path to the .png file
 * @returns {Promise<string[]>} - A promise that resolves to an array of hex strings
 */
function pngToHexArray(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(new PNG({ filterType: 4 }))
      .on('parsed', function() {
        if (this.width !== this.height) {
          console.warn(`[WARNING] Image at ${filePath} is not perfectly square (${this.width}x${this.height}). The Engine expects NxN (e.g., 32x32, 64x64).`);
        }

        const hexArray = [];

        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            
            const r = this.data[idx];
            const g = this.data[idx + 1];
            const b = this.data[idx + 2];
            const alpha = this.data[idx + 3];

            // If true transparent, map directly to Strapi compliant transparent string
            if (alpha === 0) {
              hexArray.push('#00000000');
            } else {
              // Convert to hex and pad with 0s if necessary
              const toHex = (n) => {
                const hex = n.toString(16).toUpperCase();
                return hex.length === 1 ? '0' + hex : hex;
              };
              
              const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
              hexArray.push(hexColor);
            }
          }
        }

        resolve({ hexArray, width: this.width, height: this.height });
      })
      .on('error', (err) => reject(err));
  });
}

/**
 * Converts an array of Hex strings back into an NxN PNG image
 * @param {string[]} hexArray - Array of hex strings
 * @param {number} size - The width/height length (e.g. 32, 64, 128)
 * @param {string} destPath - Absolute path to write the PNG to
 * @returns {Promise<void>}
 */
function hexArrayToPng(hexArray, size, destPath) {
  return new Promise((resolve, reject) => {
    const totalPixels = size * size;
    if (!hexArray || hexArray.length !== totalPixels) {
      return reject(new Error(`Hex array must contain exactly ${totalPixels} elements for a ${size}x${size} matrix.`));
    }

    const png = new PNG({ width: size, height: size });

    for (let i = 0; i < totalPixels; i++) {
      const idx = i << 2;
      const hex = hexArray[i] || '#00000000';
      
      if (hex === '#00000000' || hex === 'transparent') {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      } else {
        // Parse hex color e.g. #FF55AA
        const cleanHex = hex.replace('#', '');
        png.data[idx] = parseInt(cleanHex.substring(0, 2), 16);
        png.data[idx + 1] = parseInt(cleanHex.substring(2, 4), 16);
        png.data[idx + 2] = parseInt(cleanHex.substring(4, 6), 16);
        png.data[idx + 3] = cleanHex.length === 8 ? parseInt(cleanHex.substring(6, 8), 16) : 255;
      }
    }

    // Ensure directory exists
    const dirname = require('path').dirname(destPath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    png.pack()
      .pipe(fs.createWriteStream(destPath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

module.exports = { pngToHexArray, hexArrayToPng };

