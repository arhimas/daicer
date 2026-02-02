import { describe, it, expect } from 'vitest';
import { hasLineOfSight, findPath, CollisionCheck } from './spatial';
import { Point3D } from '../voxel/utils/math';

describe('Spatial Rules Engine', () => {
  describe('hasLineOfSight (Bresenham 3D)', () => {
    // Simple 10x10x10 empty space
    const emptySpace: CollisionCheck = (_p) => false;
    // Wall at x=5
    const wallAtX5: CollisionCheck = (p) => p.x === 5;

    it('should have LoS in empty space', () => {
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 10, y: 10, z: 10 };
      expect(hasLineOfSight(start, end, emptySpace)).toBe(true);
    });

    it('should be blocked by a wall', () => {
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 10, y: 0, z: 0 };
      expect(hasLineOfSight(start, end, wallAtX5)).toBe(false);
    });

    it('should not be blocked if path goes around (but LoS is a LINE)', () => {
      // Line is straight. If wall blocks the straight line, it's false.
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 10, y: 10, z: 0 }; // Diagonal pass through x=5
      // The line passes through x=5, y=5 roughly.
      // If our "wall" is every point where x=5, then yes it is blocked.
      expect(hasLineOfSight(start, end, wallAtX5)).toBe(false);
    });

    it('should handle vertical LoS', () => {
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 0, y: 0, z: 5 };
      const floorAtZ2: CollisionCheck = (p) => p.z === 2;
      expect(hasLineOfSight(start, end, floorAtZ2)).toBe(false);
    });
  });

  describe('findPath (A*)', () => {
    /* 
      Map Layout:
      S = Start (0,0,0)
      E = End (4,0,0)
      X = Wall
      
      . . . . .
      S X E . . 
      . . . . .
      
      Should fail finding path if walled off? Or go around?
      Let's test simple go-around.
      
      S . .
      X X .
      E . .
      
      Start: 0,0
      End: 0,2
      Wall: (0,1) and (1,1) -> Blocked direct.
      Path: (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2) -> (1,2) -> (0,2)? 
      Or simple U: (0,0) -> (-1,0) if bounds allow? our grid assumes infinite usually unless check fails.
      Let's assume unbounded grid for the algo, logic depends on isBlocked.
    */

    const obstacleMap: CollisionCheck = (p) => {
      // Wall at x=1, for all y except y=5 (gap)
      if (p.x === 2 && p.y !== 2) return true;
      return false;
    };

    it('should find path in open terrain', () => {
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 5, y: 0, z: 0 };
      const path = findPath(start, end, () => false);

      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ x: 0, y: 0, z: 0 }); // Start included? implementation specific describe
      // Based on implementation: openSet.push(start), reconstruct includes curr.
      // Yes, usually include start or end.
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should navigate around simple obstacle', () => {
      // Wall at x=2, gap at y=2
      // Start 0,0, end 4,0
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 4, y: 0, z: 0 };

      const path = findPath(start, end, obstacleMap);
      expect(path.length).toBeGreaterThan(0);

      // Ensure no point in path is blocked
      path.forEach((p) => {
        expect(obstacleMap(p)).toBe(false);
      });

      // Should have gone "up" to y=2 to cross x=2
      const wpts = path.filter((p) => p.x === 2);
      expect(wpts.length).toBeGreaterThan(0);
      expect(wpts[0].y).toBe(2);
    });

    it('should return empty array if no path', () => {
      const cage: CollisionCheck = (p) => {
        // Box around 0,0
        return Math.abs(p.x) >= 2 || Math.abs(p.y) >= 2 || Math.abs(p.z) >= 2;
      };
      const start: Point3D = { x: 0, y: 0, z: 0 };
      const end: Point3D = { x: 10, y: 0, z: 0 };

      const path = findPath(start, end, cage);
      expect(path).toEqual([]);
    });
  });
});
