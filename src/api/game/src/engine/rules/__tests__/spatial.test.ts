import { hasLineOfSight, findPath, Point3D } from '../spatial';

describe('Spatial Engine', () => {
    describe('Bresenham Line of Sight (3D)', () => {
         const emptySpace = (_: Point3D) => false;
         const obstacleAt = (target: Point3D) => (p: Point3D) => p.x === target.x && p.y === target.y && p.z === target.z;
         // const wallAtX5 = (p: Point3D) => p.x === 5;

        it('should have LoS in empty space', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 10, y: 10, z: 10 };
            expect(hasLineOfSight(start, end, emptySpace)).toBe(true);
        });

        it('should be blocked by an obstacle in the path', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 10, y: 0, z: 0 };
            const block = obstacleAt({ x: 5, y: 0, z: 0 }); // Directly in middle
            expect(hasLineOfSight(start, end, block)).toBe(false);
        });

         it('should pass if obstacles are nearby but not on line', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 10, y: 0, z: 0 };
            // Block is at y=1, path is at y=0
            const block = obstacleAt({ x: 5, y: 1, z: 0 }); 
            expect(hasLineOfSight(start, end, block)).toBe(true);
        });

        it('should handle diagonal checks', () => {
            // 0,0 -> 2,2 passes through 1,1
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 2, y: 2, z: 0 };
            const block = obstacleAt({ x: 1, y: 1, z: 0 });
            expect(hasLineOfSight(start, end, block)).toBe(false);
        });
        
        it('should handle vertical checks (Z-axis)', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 0, y: 0, z: 10 };
            const block = obstacleAt({ x: 0, y: 0, z: 5 });
            expect(hasLineOfSight(start, end, block)).toBe(false);
        });
    });

    describe('A* Pathfinding', () => {
        // Simple 2D infinite grid for testing
        // blocked if x is 5 and y is > 0 and y < 10 (Wall with gap)
        const wallWithGap = (p: Point3D) => {
            if (p.x === 5) {
                // Gap at y=5
                return p.y !== 5;
            }
            return false;
        };

        it('finds path in direct line empty space', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 3, y: 0, z: 0 };
            const empty = () => false;
            
            const path = findPath(start, end, empty);
            expect(path.length).toBeGreaterThan(0);
            expect(path[0]).toEqual(start);
            expect(path[path.length - 1]).toEqual(end);
            // Straight line 0,0 -> 1,0 -> 2,0 -> 3,0 (4 steps)
            expect(path.length).toBe(4); 
        });

        it('navigates around a wall', () => {
            const start = { x: 0, y: 0, z: 0 };
            const end = { x: 10, y: 0, z: 0 };
            
            // Simple obstacle: Single point at 5,0
            const singleBlock = (p: Point3D) => p.x === 5 && p.y === 0 && p.z === 0;

            const path = findPath(start, end, singleBlock);
            
            expect(path.length).toBeGreaterThan(0);
            // Should verify it didn't step on 5,0
            const steppedOnBlock = path.some(p => p.x === 5 && p.y === 0 && p.z === 0);
            expect(steppedOnBlock).toBe(false);
        });

        it('returns empty array if unreachable', () => {
             const start = { x: 0, y: 0, z: 0 };
             const end = { x: 10, y: 0, z: 0 };
             // Box in the target
             const cage = (p: Point3D) => {
                 return (Math.abs(p.x - end.x) <= 1 && Math.abs(p.y - end.y) <= 1);
             };
             
             // Iteration limit prevents infinite loops, but A* determines unreachable via openSet exhaustion
             // For this test, ensure the cage is solid properly or just use maxIterations
             const path = findPath(start, end, cage, 100);
             expect(path).toEqual([]);
        });
        
        it('navigates through a gap', () => {
             const start = { x: 0, y: 5, z: 0 }; // Start aligned with gap
             const end = { x: 10, y: 5, z: 0 }; // End aligned with gap
             const result = findPath(start, end, wallWithGap);
             
             expect(result.length).toBeGreaterThan(0);
             // Verify it passed through 5,5
             const passedGap = result.some(p => p.x === 5 && p.y === 5);
             expect(passedGap).toBe(true);
        });
    });
});
