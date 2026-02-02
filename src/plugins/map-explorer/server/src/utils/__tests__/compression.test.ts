import { describe, it, expect } from 'vitest';
import { EntityGeometry } from '../EntityGeometry';

describe('EntityGeometry Compression', () => {
  it('should compress a transparent row', () => {
    const row = Array(32).fill('transparent');
    const compressed = EntityGeometry.compressRow(row);
    // Expect format: ["32xT"]
    expect(compressed).toEqual(['32xT']);
  });

  it('should compress mixed content', () => {
    const row = ['red', 'red', 'transparent', 'transparent', 'blue'];
    const compressed = EntityGeometry.compressRow(row);
    // Expect: ["2xred", "2xT", "1xblue"]
    expect(compressed).toEqual(['2xred', '2xT', '1xblue']);
  });

  it('should decompress correctly', () => {
    const compressed = ['2xred', '3xT', '1xblue'];
    const decompressed = EntityGeometry.decompressRow(compressed);
    expect(decompressed).toEqual([
      'red',
      'red',
      'transparent',
      'transparent',
      'transparent',
      'blue',
    ]);
  });

  it('should handle full grid compression', () => {
    const grid = [Array(32).fill('transparent'), Array(32).fill('black')];
    const compressed = EntityGeometry.compressGrid(grid);
    expect(compressed).toEqual([['32xT'], ['32xblack']]);

    expect(EntityGeometry.decompressGrid(compressed)).toEqual(grid);
  });
});
