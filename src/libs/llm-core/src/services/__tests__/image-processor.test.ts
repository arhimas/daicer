import { describe, it, expect } from 'vitest';
import { ImageProcessor } from '@daicer/llm-core/services/image-processor';
import Jimp from 'jimp';

describe('ImageProcessor', () => {
  it('should convert a 2D Hex Array into a PNG Buffer for blueprint silhouette injection', async () => {
    const mockGrid = [
      ['transparent', '#FF0000FF', 'transparent'],
      ['#00FF00FF', '#0000FFFF', '#FFFFFFFF'],
      ['transparent', 'none', '#000000FF']
    ];

    const base64 = await ImageProcessor.hexArrayToPng(mockGrid);
    
    // Validate output format
    expect(base64.startsWith('data:image/png;base64,')).toBe(true);

    // Verify properties by reading it back into Jimp
    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const image = await Jimp.read(buffer);

    expect(image.bitmap.width).toBe(3);
    expect(image.bitmap.height).toBe(3);

    // Check specific pixels. Jimp returns RGBA hex integers.
    // [0][0] Transparent
    expect(Jimp.intToRGBA(image.getPixelColor(0, 0)).a).toBe(0);
    
    // [0][1] Red
    const redPixel = Jimp.intToRGBA(image.getPixelColor(1, 0));
    expect(redPixel.r).toBe(255);
    expect(redPixel.g).toBe(0);
    expect(redPixel.b).toBe(0);
    expect(redPixel.a).toBe(255);

    // [2][2] Black
    const blackPixel = Jimp.intToRGBA(image.getPixelColor(2, 2));
    expect(blackPixel.r).toBe(0);
    expect(blackPixel.g).toBe(0);
    expect(blackPixel.b).toBe(0);
    expect(blackPixel.a).toBe(255);
  });

  it('should remove the background color, quantize RGBA, and resize via Nearest Neighbor', async () => {
    // Create a 2x2 mock base64 image
    // [White (BG)]  [Light Red (to be quantized)]
    // [White (BG)]  [Dark Blue (to be quantized)]
    const mockImage = await Jimp.create(2, 2, 0xFFFFFFFF); // All White
    mockImage.setPixelColor(0xFF8080FF, 1, 0); // Light Red
    mockImage.setPixelColor(0x000080FF, 1, 1); // Dark Blue
    
    const originalBuffer = await mockImage.getBufferAsync(Jimp.MIME_PNG);
    const originalBase64 = `data:image/png;base64,${originalBuffer.toString('base64')}`;

    // Target size is 4x4 (scaling up 2x). Should retain sharp edges (Nearest Neighbor)
    const resultBase64 = await ImageProcessor.processImage(originalBase64, 4);
    
    // Read the processed image back
    const buffer = Buffer.from(resultBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const processedImage = await Jimp.read(buffer);

    // 1. Validate Resizing
    expect(processedImage.bitmap.width).toBe(4);
    expect(processedImage.bitmap.height).toBe(4);

    // 2. Validate Background Removal (The left 2x4 chunk should be transparent, matching [0,0])
    expect(Jimp.intToRGBA(processedImage.getPixelColor(0, 0)).a).toBe(0);
    expect(Jimp.intToRGBA(processedImage.getPixelColor(0, 1)).a).toBe(0);
    expect(Jimp.intToRGBA(processedImage.getPixelColor(1, 1)).a).toBe(0);

    // 3. Validate Quantization & Nearest Neighbor Scaling (The right 2x4 chunk)
    // The Light Red (255, 128, 128) should be rounded to modulo 17:
    // R: 255 -> 255, G: 128 -> 119, B: 128 -> 119 (Quantized 4-bit web-safe approximation)
    const quantizedRed = Jimp.intToRGBA(processedImage.getPixelColor(2, 0));
    expect(quantizedRed.a).toBe(255);
    expect(quantizedRed.r).toBeGreaterThan(250); // Red stays max
    expect(quantizedRed.g % 17).toBe(0); // Proves quantization
    expect(quantizedRed.b % 17).toBe(0); // Proves quantization
    
    // Due to Nearest neighbor, pixel (3,0) should perfectly match (2,0)
    const neighborRed = Jimp.intToRGBA(processedImage.getPixelColor(3, 0));
    expect(neighborRed.r).toBe(quantizedRed.r);
    expect(neighborRed.g).toBe(quantizedRed.g);
  });

  it('should unwrap a processed image identically back into a 2D Map Explorer Grid', async () => {
    // 2x2 mock
    const mockImage = await Jimp.create(2, 2, 0x00000000); // All Transparent
    mockImage.setPixelColor(0xFF0000FF, 0, 0); // Red top left
    mockImage.setPixelColor(0x00FF00FF, 1, 1); // Green bottom right

    const originalBuffer = await mockImage.getBufferAsync(Jimp.MIME_PNG);
    const originalBase64 = `data:image/png;base64,${originalBuffer.toString('base64')}`;

    const hexGrid = await ImageProcessor.toHexArray(originalBase64, 2);

    expect(hexGrid.length).toBe(2);
    expect(hexGrid[0].length).toBe(2);

    expect(hexGrid[0][0]).toBe('#FF0000FF');
    expect(hexGrid[0][1]).toBe('transparent');
    expect(hexGrid[1][0]).toBe('transparent');
    expect(hexGrid[1][1]).toBe('#00FF00FF');
  });
});
