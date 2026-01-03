import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TileInspector } from '../TileInspector';

describe('TileInspector', () => {
  it('should render empty state when null', () => {
    render(<TileInspector coords={null} tileData={null} isReachable={false} distance={null} />);
    expect(screen.getByText('Hover over maps to inspect tiles')).toBeInTheDocument();
  });

  it('should render coordinates', () => {
    const coords = { x: 1, y: 2, z: 3 };
    const data = { biome: 'forest', block: 'grass', isWalkable: true, isTransparent: true };
    render(<TileInspector coords={coords} tileData={data} isReachable={true} distance={5} />);

    expect(screen.getByText('X:1 Y:2 Z:3')).toBeInTheDocument();
  });

  it('should render tile properties', () => {
    const coords = { x: 0, y: 0, z: 0 };
    const data = { biome: 'forest_plains', block: 'stone_wall', isWalkable: true, isTransparent: true };
    render(<TileInspector coords={coords} tileData={data} isReachable={true} distance={5} />);

    expect(screen.getByText('forest plains')).toBeInTheDocument(); // .replace('_', ' ')
    expect(screen.getByText('stone wall')).toBeInTheDocument();
  });

  it('should render status YES', () => {
    const coords = { x: 0, y: 0, z: 0 };
    const data = { biome: 'a', block: 'b', isWalkable: true, isTransparent: true };
    render(<TileInspector coords={coords} tileData={data} isReachable={true} distance={5} />);

    const yesLabels = screen.getAllByText('YES');
    expect(yesLabels.length).toBeGreaterThan(1); // Walkable, Transparent
  });

  it('should render status NO', () => {
    const coords = { x: 0, y: 0, z: 0 };
    const data = { biome: 'a', block: 'b', isWalkable: false, isTransparent: false };
    render(<TileInspector coords={coords} tileData={data} isReachable={true} distance={5} />);

    const noLabels = screen.getAllByText('NO');
    expect(noLabels.length).toBeGreaterThan(1);
  });

  it('should render reachability info', () => {
    const coords = { x: 0, y: 0, z: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = { biome: 'a', block: 'b', isWalkable: true, isTransparent: true } as any;

    // Reachable
    const { rerender } = render(<TileInspector coords={coords} tileData={data} isReachable={true} distance={10} />);
    expect(screen.getByText('YES (10 tiles)')).toBeInTheDocument();

    // Not Reachable
    rerender(<TileInspector coords={coords} tileData={data} isReachable={false} distance={null} />);
    // "Reachable" row logic: isReachable ? ... : 'NO'
    // Need to be specific because we have other NOs potentially
    // But in this case, the text is exactly 'NO'
    // Let's verify specific element
    const noText = screen
      .getAllByText('NO')
      .find(
        (el) => el.parentElement?.innerHTML.includes('reacheable') || el.parentElement?.innerHTML.includes('Reachable')
      );
    expect(noText).toBeInTheDocument();
  });
});
