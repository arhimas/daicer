
/**
 * Calculates pixel coordinates for a given geometric shape.
 *
 * @param p1 - Start point coordinate.
 * @param p2 - End point coordinate.
 * @param toolType - The type of shape to generate ('rect' or 'circle').
 * @returns An array of `{x, y}` coordinates representing the filled shape.
 */
export const getShapePixels = (p1: {x:number, y:number}, p2: {x:number, y:number}, toolType: 'rect' | 'circle') => {
    const pixels: {x:number, y:number}[] = [];
    const x1 = Math.min(p1.x, p2.x);
    const x2 = Math.max(p1.x, p2.x);
    const y1 = Math.min(p1.y, p2.y);
    const y2 = Math.max(p1.y, p2.y);

    if (toolType === 'rect') {
        for(let x = x1; x <= x2; x++) {
            for(let y = y1; y <= y2; y++) {
                pixels.push({x, y});
            }
        }
    } else if (toolType === 'circle') {
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radiusX = (x2 - x1) / 2;
        const radiusY = (y2 - y1) / 2;

        for(let x = x1; x <= x2; x++) {
            for(let y = y1; y <= y2; y++) {
                const normalizedX = (x - centerX) / (radiusX + 0.5); 
                const normalizedY = (y - centerY) / (radiusY + 0.5);
                if ((normalizedX * normalizedX + normalizedY * normalizedY) <= 1.0) {
                    pixels.push({x, y});
                }
            }
        }
    }
    return pixels;
};
