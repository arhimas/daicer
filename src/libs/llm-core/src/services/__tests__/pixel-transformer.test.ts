import { describe, it, expect } from 'vitest';
import { PixelTransformer } from '@daicer/llm-core/services/pixel-transformer';

describe('PixelTransformer', () => {
  describe('parseRGBA4444', () => {
    it('correctly maps 4-bit hex to 8-bit hex', () => {
      // "f00f" -> "#ff0000ff"
      expect(PixelTransformer.parseRGBA4444('f00f')).toBe('#FF0000FF');
      expect(PixelTransformer.parseRGBA4444('#0a0f')).toBe('#00AA00FF');
    });

    it('falls back to transparent on invalid input or hallucination mappings', () => {
      expect(PixelTransformer.parseRGBA4444('transparent')).toBe('transparent');
      expect(PixelTransformer.parseRGBA4444('none')).toBe('transparent');
      expect(PixelTransformer.parseRGBA4444('F0')).toBe('transparent'); // Too short
      expect(PixelTransformer.parseRGBA4444('FF0000FFFF')).toBe('transparent'); // Too long
    });
    
    it('accepts valid 6 or 8 bit hex formats without changing them', () => {
        expect(PixelTransformer.parseRGBA4444('FFFFFF')).toBe('#FFFFFF');
        expect(PixelTransformer.parseRGBA4444('#FF00FF00')).toBe('#FF00FF00');
    });
  });

  describe('enforceSquaredness', () => {
    it('centers and pads a smaller grid symmetrically', () => {
      const smallGrid = [
        ['#FF0000FF', '#00FF00FF'],
        ['#0000FFFF', '#FFFFFFFF']
      ];
      const targetSize = 4;
      const padded = PixelTransformer.enforceSquaredness(smallGrid, targetSize);

      // We expect a 4x4 array. Center pad means row [1] and [2] hold the 2x2.
      expect(padded.length).toBe(4);
      expect(padded[0].length).toBe(4);
      
      // Top row transparent
      expect(padded[0][0]).toBe('transparent');
      expect(padded[0][1]).toBe('transparent');

      // Object starts at Y=1, X=1
      expect(padded[1][1]).toBe('#FF0000FF');
      expect(padded[2][2]).toBe('#FFFFFFFF');

      // Bot row transparent
      expect(padded[3][3]).toBe('transparent');
    });

    it('crops symmetrically if the grid is larger than targetSize', () => {
      const oversizedGrid = [
        ['transparent', 'transparent', 'transparent', 'transparent'],
        ['transparent', '#FF0000FF', '#00FF00FF', 'transparent'],
        ['transparent', '#0000FFFF', '#FFFFFFFF', 'transparent'],
        ['transparent', 'transparent', 'transparent', 'transparent'],
      ];
      const targetSize = 2; // Should crop outer edges and leave the center 2x2

      const cropped = PixelTransformer.enforceSquaredness(oversizedGrid, targetSize);

      expect(cropped.length).toBe(2);
      expect(cropped[0].length).toBe(2);
      expect(cropped[0][0]).toBe('#FF0000FF'); // Kept inner core
      expect(cropped[1][1]).toBe('#FFFFFFFF');
    });
  });

  describe('processAndSquareSprite (E2E Integration)', () => {
    it('parses ASCII and palette smoothly into a squared Target Size Matrix', () => {
       const payload = {
        asciiGrid: [
            '.x.',
            'x#x',
            '.x.'
        ],
        palette: {
            "x": "00ff", // Blue
            "#": "f00f", // Red
        }
       };

       // Force it onto a 5x5 grid (padding)
       const result = PixelTransformer.processAndSquareSprite(payload, 5);
       expect(result.length).toBe(5);
       
       // Center of 5x5 is index [2][2] (The '#')
       expect(result[2][2]).toBe('#FF0000FF');
       
       // Top edge of the cross is [1][2] (The 'x')
       expect(result[1][2]).toBe('#0000FFFF');
    });

    it('handles hallucinations silently turning them to transparent', () => {
       const payload = {
         asciiGrid: ['.?.', '...'],
         palette: { "x": "f00f" } // Missing "?" in palette
       };

       const result = PixelTransformer.processAndSquareSprite(payload, 2);
       expect(result[0][0]).toBe('transparent');
    });
  });
});
