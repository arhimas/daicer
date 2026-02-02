import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RenderEngine } from '../render-engine';
import { Chunk } from '../../types';

// Mock Canvas Context
const mockCtx = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  // Properties
  canvas: { width: 512, height: 512 },
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  imageSmoothingEnabled: true,
} as unknown as CanvasRenderingContext2D;

describe('RenderEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a hex color block correctly', () => {
    const chunk: Chunk = {
      x: 0,
      y: 0,
      tiles: [
        [
          [
            {
              x: 0,
              y: 0,
              z: 0,
              block: '#ff0000',
              biome: 'custom',
              isWalkable: true,
              isTransparent: false,
              variant: 0,
            },
          ],
        ],
      ],
    };

    RenderEngine.render(mockCtx, chunk, 0, 1, { x: 0, y: 0 }, []);

    // Expect fillRect to be called with red
    expect(mockCtx.fillStyle).toBe('#ff0000');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 32, 32);
  });

  it('should fall back to pink for unknown strings', () => {
    const chunk: Chunk = {
      x: 0,
      y: 0,
      tiles: [
        [
          [
            {
              x: 0,
              y: 0,
              z: 0,
              block: 'unknown_slug',
              biome: 'custom',
              isWalkable: true,
              isTransparent: false,
              variant: 0,
            },
          ],
        ],
      ],
    };

    RenderEngine.render(mockCtx, chunk, 0, 1, { x: 0, y: 0 }, []);

    // Expect fillRect to be called with red
    expect(mockCtx.fillStyle).toBe('#9e9e9e');
  });

  it('should handle flattened texture array override', () => {
    const chunk: Chunk = {
      x: 0,
      y: 0,
      tiles: [
        [
          [
            {
              x: 0,
              y: 0,
              z: 0,
              block: 'stone',
              biome: 'custom',
              isWalkable: true,
              isTransparent: false,
              variant: 0,
              pixels: [
                { x: 0, y: 0, z: 0, block: '#00ff00' }, // Green Pixel
              ] as any,
            },
          ],
        ],
      ],
    };

    RenderEngine.render(mockCtx, chunk, 0, 1, { x: 0, y: 0 }, []);

    // Expect fillRect to be called with green from pixel override
    expect(mockCtx.fillStyle).toBe('#00ff00');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
  });
});
