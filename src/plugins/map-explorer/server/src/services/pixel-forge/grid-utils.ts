export const createEmptyGrid = (size = 32) => {
    return Array(size).fill(null).map(() => Array(size).fill(null));
};

export const fillBox = (grid: (string | null)[][], x: number, y: number, w: number, h: number, color: string) => {
    const gridSize = grid.length;
    for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
            if (iy >= 0 && iy < gridSize && ix >= 0 && ix < gridSize) {
                grid[iy][ix] = color;
            }
        }
    }
};

export const markBox = (grid: (string | null)[][], x: number, y: number, w: number, h: number, type: string) => {
    const gridSize = grid.length;
    for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
            if (iy >= 0 && iy < gridSize && ix >= 0 && ix < gridSize) {
                grid[iy][ix] = type;
            }
        }
    }
};
