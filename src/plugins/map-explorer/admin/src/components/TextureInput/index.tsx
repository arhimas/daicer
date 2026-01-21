import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Flex,
  SingleSelect,
  SingleSelectOption,
  Grid
} from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { useIntl } from 'react-intl';
import { Trash, Drag, Pencil, Crop, ChartCircle, Information, Magic } from '@strapi/icons';
import { RenderEngine } from '../../utils/render-engine';
import { TerrainType, Chunk } from '../../types';

// Constants for Texture Mode
const GRID_SIZE = 32;
const MAX_Z = 0;

interface TextureInputProps {
  name: string;
  value?: string | null;
  onChange: (e: { target: { name: string; value: unknown; type: string } }) => void;
  attribute: { type: string; customField: string };
  intlLabel: any;
}

export const TextureInput = React.forwardRef<HTMLInputElement, TextureInputProps>((props, _ref) => {
    const { name, value, onChange, attribute, intlLabel } = props;
    const { formatMessage } = useIntl();
    const { post } = useFetchClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Access Parent Entity Context
    const ctx: any = useContentManagerContext ? useContentManagerContext() : { form: { values: {} } };
    const modifiedData = ctx?.form?.values || {};

    // State
    const [chunk, setChunk] = useState<Chunk | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>('#000000');
    
    // Viewport
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'brush' | 'pan' | 'rect' | 'circle'>('brush');
    
    const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
    const [dragEnd, setDragEnd] = useState<{x: number, y: number} | null>(null);

    // Initial Data Load
    useEffect(() => {
        // Create Default Filled Grid (Grey #888888)
        const createDefaultTile = (x: number, y: number) => ({
             x, y, z: 0,
             block: '#888888',
             biome: 'custom',
             isWalkable: true,
             isTransparent: false,
             variant: 0
        });

        const defaultLayers = Array(MAX_Z + 1).fill(null).map(() => 
            Array(GRID_SIZE).fill(null).map((_, y) => 
                Array(GRID_SIZE).fill(null).map((_, x) => createDefaultTile(x, y))
            )
        );
        
        // If there is no value, using defaultLayers is correct for visual, 
        // BUT we must also trigger onChange to ensure the form sees this data!
        // Otherwise, if user saves without drawing, it saves NULL.
        
        let loadedTiles = defaultLayers;
        let requiresAutoFill = true;

        if (value) {
            try {
                const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                    
                    const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
                    loadedTiles = emptyLayers;
                    requiresAutoFill = false;

                    parsedValue.forEach((v: Record<string, any>) => {
                         if (v.z === 0 && v.y >= 0 && v.y < GRID_SIZE && v.x >= 0 && v.x < GRID_SIZE) {
                             if (!loadedTiles[0]) loadedTiles[0] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
                             if (!loadedTiles[0][v.y]) loadedTiles[0][v.y] = Array(GRID_SIZE).fill(null);
                             
                             loadedTiles[0][v.y][v.x] = {
                                 x: v.x, y: v.y, z: 0,
                                 block: v.type || v.block, 
                                 biome: 'custom',
                                 isWalkable: true,
                                 isTransparent: false,
                                 variant: 0
                             };
                         }
                    });
                }
            } catch (e) {
                console.error("Failed to parse texture data", e);
            }
        }
        
        setChunk({ x: 0, y: 0, tiles: loadedTiles });

        // AUTO-FILL PROPAGATION
        if (requiresAutoFill) {
            // We need to wait a tick or just call it? 
            // Calling directly inside effect is fine usually, unless loop.
            // requiresAutoFill is true only if value was empty.
            // But if we call onChange, value updates, effect runs again... loop?
            // Yes, infinite loop if we aren't careful.
            // Check if value is ALREADY what we want? No, value is string/json.
            // We can check if value is falsy.
            if (!value) {
                 // Construct the flattened representation of defaultLayers
                 const flattenedVoxels: {x:number, y:number, z:number, type: string}[] = [];
                 defaultLayers.forEach((layer, z) => {
                    layer?.forEach((row, y) => {
                        row?.forEach((tile, x) => {
                            if (tile && tile.block !== 'air') {
                                flattenedVoxels.push({ x, y, z, type: tile.block });
                            }
                        });
                    });
                });
                // Trigger change to populate form
                // Use setTimeout to avoid React render cycle warnings
                setTimeout(() => {
                    onChange({ target: { name, value: JSON.stringify(flattenedVoxels), type: attribute.type } });
                }, 100);
            }
        }

    }, [value]);

    // Render Canvas (Direct Implementation to avoid RenderEngine complexity)
    useEffect(() => {
        if (!canvasRef.current || !chunk || !chunk.tiles[0]) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Reset
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.imageSmoothingEnabled = false;

        // Transform
        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // Grid Lines
        const TILE_SIZE = 32; // Texture Mode is 32x32 grid, each block is a pixel visually
        // Actually, TextureInput usually renders big. 
        // Previously TILE_SIZE=32 implied 32px per cell? 
        // Yes, 512x512 canvas / 16 grid = 32. 
        // But GRID_SIZE is 32. So 32x32 grid.
        // Canvas is 512x512. So 512/32 = 16 pixels per cell.
        
        const CELL_SIZE = 512 / GRID_SIZE; // 16px

        // Draw Pixels
        chunk.tiles[0].forEach((row, y) => {
            if (!row) return;
            row.forEach((tile, x) => {
                if (!tile) return;
                
                let color = tile.block;
                // Simple Fallback
                if (!color || color === 'air') return; // Transparent
                
                // If not hex, try to map (legacy)
                if (!color.startsWith('#') && !color.startsWith('rgb')) {
                     // Try Sensible Defaults map manually or just Grey
                     if (color === 'stone') color = '#7d7d7d';
                     else if (color === 'dirt') color = '#5d4037';
                     else if (color === 'grass') color = '#4caf50';
                     else color = '#888888'; // Default Grey
                }

                ctx.fillStyle = color;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        });

        // Grid Overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1 / scale; 
        ctx.beginPath();
        for(let i=0; i<=GRID_SIZE; i++) {
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, 512);
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(512, i * CELL_SIZE);
        }
        ctx.stroke();

    }, [chunk, scale, pan]);


    // Handlers
    const handleWheel = (e: React.WheelEvent) => {
        const newScale = Math.max(0.5, Math.min(4, scale - e.deltaY * 0.001));
        setScale(newScale);
    };

    const getTileCoords = (e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const CELL_SIZE = 16; // 512 / 32
        
        const localX = (e.clientX - rect.left);
        const localY = (e.clientY - rect.top);

        const cssScaleX = canvasRef.current.width / rect.width;
        const cssScaleY = canvasRef.current.height / rect.height;

        const canvasX = localX * cssScaleX;
        const canvasY = localY * cssScaleY;

        const worldX = (canvasX - pan.x) / scale;
        const worldY = (canvasY - pan.y) / scale;

        return {
            x: Math.floor(worldX / CELL_SIZE),
            y: Math.floor(worldY / CELL_SIZE)
        };
    };

    const propagateChange = (updatedChunk: Chunk) => {
        const flattenedVoxels: {x:number, y:number, z:number, type: string}[] = [];
        updatedChunk.tiles.forEach((layer, z) => {
            if (!layer) return;
            layer.forEach((row, y) => {
                if (!row) return;
                row.forEach((tile, x) => {
                    if (tile && tile.block !== 'air') {
                        flattenedVoxels.push({ x, y, z, type: tile.block });
                    }
                });
            });
        });
        onChange({ target: { name, value: flattenedVoxels, type: attribute.type } });
    };

     const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan' || e.button === 1) { 
            setIsPanning(true);
            setLastMouse({ x: e.clientX, y: e.clientY });
        } else {
            // Brush
            drawPixel(e);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMouse({ x: e.clientX, y: e.clientY });
        } else if (tool === 'brush' && e.buttons === 1) {
            drawPixel(e);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const drawPixel = (e: React.MouseEvent) => {
        if (!chunk) return;
        const tile = getTileCoords(e);
        
        if (tile.x >= 0 && tile.x < GRID_SIZE && tile.y >= 0 && tile.y < GRID_SIZE) {
            const newChunk = { ...chunk };
            if (!newChunk.tiles[0]) newChunk.tiles[0] = [];
            if (!newChunk.tiles[0][tile.y]) newChunk.tiles[0][tile.y] = Array(GRID_SIZE).fill(null);
            
            newChunk.tiles[0][tile.y][tile.x] = {
                x: tile.x, y: tile.y, z: 0,
                block: selectedColor,
                biome: 'custom',
                isWalkable: true,
                isTransparent: false,
                variant: 0
            };
            setChunk(newChunk);
            propagateChange(newChunk);
        }
    };

    const handleClear = () => {
         // Clear to Default Grey instead of Air/Null?
         // User might want to clear to "Empty". 
         // But "Clear" usually means empty canvas.
         // Ill stick to empty for Clear button.
         const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
         const newChunk = { x: 0, y: 0, tiles: emptyLayers };
         setChunk(newChunk);
         propagateChange(newChunk);
    };

    const handleGenerate = async () => {
        try {
            const size = modifiedData?.size || 'Medium'; // Default to Medium
            const { data } = await post('/map-explorer/generate-texture', { size, context: 'entity' });
            
            if (data && data.tiles) {
                // Ensure tiles has proper structure for our component (Chunk)
                // Backend returns { x, y, tiles: [ [row...], ... ] }
                setChunk(data);
                propagateChange(data);
            }
        } catch (e) {
            console.error("Failed to generate texture", e);
        }
    };

    const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel?.defaultMessage || name);

    // Sensible Earth Tones Palette
    const PALETTE = [
        '#000000', '#FFFFFF', '#888888', '#555555', // Greyscale
        '#7d7d7d', // Stone
        '#5d4037', // Dirt
        '#4caf50', // Grass
        '#2196f3', // Water
        '#fbc02d', // Sand
        '#795548', // Wood
        '#388e3c', // Leaf
        '#aed581', // Glass/Gem
        // Other Valid HTML colors
        '#F4A460', '#8B4513' 
    ];

    return (
         <Box>
            <Flex gap={2} alignItems="center">
                 <Typography variant="pi" fontWeight="bold">{label}</Typography>
                 <Typography variant="sigma" textColor="neutral600">(Texture Mode 32x32) [v2]</Typography>
            </Flex>
            
            <Box paddingTop={2}>
                 <Grid.Root gap={4}>
                     <Grid.Item col={8} s={12}>
                        
                        {/* Toolbar */}
                        <Flex gap={2} paddingBottom={2}>
                            <Button 
                                variant={tool === 'brush' ? 'default' : 'secondary'} 
                                onClick={() => setTool('brush')}
                                startIcon={<Pencil />}
                                size="S"
                            >
                                Brush
                            </Button>
                            <Button 
                                variant={tool === 'pan' ? 'default' : 'secondary'} 
                                onClick={() => setTool('pan')}
                                startIcon={<Drag />} 
                                size="S"
                            >
                                Pan
                            </Button>
                            <Button 
                                variant="tertiary" 
                                onClick={handleGenerate} 
                                startIcon={<Magic />}
                                size="S"
                                title={`Generate from Size: ${modifiedData?.size || 'Unknown'}`}
                            >
                                Generate
                            </Button>
                            <Button 
                                variant="danger-light" 
                                onClick={handleClear} 
                                startIcon={<Trash />}
                                size="S"
                            >
                                Clear
                            </Button>
                        </Flex>

                        <Box 
                            background="neutral150" 
                            padding={2} 
                            hasRadius 
                            shadow="filterShadow" 
                            style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', width: '100%' }}
                        >
                            <canvas 
                                ref={canvasRef} 
                                width={512} 
                                height={512}
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ 
                                    width: '100%', 
                                    maxWidth: 'none', 
                                    cursor: tool === 'pan' ? 'grab' : 'crosshair', 
                                    imageRendering: 'pixelated' 
                                }} 
                            />
                        </Box>
                     </Grid.Item>
                     <Grid.Item col={4} s={12}>
                         <Box>
                            <Typography variant="sigma">Color Palette</Typography>
                             <Flex gap={2} paddingTop={2} wrap="wrap">
                                {PALETTE.map(c => (
                                    <Box 
                                        key={c}
                                        background={c}
                                        width="24px" 
                                        height="24px" 
                                        hasRadius 
                                        cursor="pointer"
                                        borderColor={selectedColor === c ? 'primary600' : 'neutral200'}
                                        borderWidth={selectedColor === c ? '2px' : '1px'}
                                        borderStyle="solid"
                                        onClick={() => setSelectedColor(c)}
                                    />
                                ))}
                             </Flex>
                             <Box paddingTop={4}>
                                <Typography variant="pi">Custom Hex</Typography>
                                <input 
                                    type="color" 
                                    value={selectedColor} 
                                    onChange={e => setSelectedColor(e.target.value)} 
                                    style={{width: '100%', height: '40px', marginTop: '8px'}} 
                                />
                             </Box>
                         </Box>
                     </Grid.Item>
                 </Grid.Root>
            </Box>
        </Box>
    );
});
