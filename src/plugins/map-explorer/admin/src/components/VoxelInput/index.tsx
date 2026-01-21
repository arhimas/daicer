import React, { useRef, useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin'; 
import { 
  Box, 
  Typography, 
  Button, 
  Flex,
  SingleSelect,
  SingleSelectOption,
  Grid,
  IconButton
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Trash, Drag, Pencil, Crop, ChartCircle, Information } from '@strapi/icons';
import { BlockType, Chunk, TerrainType } from '../../types';
import { TILE_SIZE, BLOCK_COLORS, BLOCK_TYPES } from '../../constants';
import { getShapePixels } from '../../utils/shape-tools';
import { RenderEngine } from '../../utils/render-engine';
import { PixelEditor } from '../PixelEditor';

// Internal constants for this component to match user expectations
const DISPLAY_Z_MIN = -3;
const DISPLAY_Z_MAX = 3;
const TOTAL_LAYERS = 7; 

interface VoxelInputProps {
  name: string;
  value?: string | null;
  onChange: (e: { target: { name: string; value: unknown; type: string } }) => void;
  attribute: { type: string; customField: string };
  intlLabel: any;
}



export const VoxelInput = React.forwardRef<HTMLInputElement, VoxelInputProps>((props, _ref) => { // Ref is forwarded but not used locally
    const { name, value, onChange, attribute, intlLabel } = props;
    const { formatMessage } = useIntl();
    const { get } = useFetchClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [chunk, setChunk] = useState<Chunk | null>(null);
    const [currentZ, setCurrentZ] = useState(3); 
    const [selectedBlock, setSelectedBlock] = useState<string>('stone');
    const [terrains, setTerrains] = useState<TerrainType[]>([]);

    // Viewport State
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'brush' | 'pan' | 'rect' | 'circle' | 'detail'>('brush');
    
    // Pixel Editor State
    const [isPixelEditorOpen, setIsPixelEditorOpen] = useState(false);
    const [detailTarget, setDetailTarget] = useState<{x:number, y:number, z:number} | null>(null);
    
    // Shape Drag State
    const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
    const [dragEnd, setDragEnd] = useState<{x: number, y: number} | null>(null);

    // Fetch Terrains
    useEffect(() => {
        const fetchTerrains = async () => {
            try {
                // Fetch from content-manager or a custom endpoint if needed.
                // Using content-manager generic endpoint for 'api::terrain.terrain'
                const { data } = await get('/content-manager/collection-types/api::terrain.terrain?page=1&pageSize=100&populate=*');
                if (data && data.results) {
                    setTerrains(data.results);
                    if (data.results.length > 0) {
                        setSelectedBlock(data.results[0].slug); // Default to first available
                    }
                }
            } catch (err) {
                console.error("Failed to fetch terrains", err);
                // Fallback to basic list if fetch fails or dev mode empty
                setTerrains([
                    { slug: 'stone', name: 'Stone', color: '#888888' },
                    { slug: 'grass', name: 'Grass', color: '#00ff00' },
                    { slug: 'water', name: 'Water', color: '#0000ff' }
                ]);
            }
        };
        fetchTerrains();
    }, []);

    // Helper: Get Color (Deprecated, using RenderEngine)


    // ... (Initialize Effect - keep same but ensure block type string handling)
    const GRID_SIZE = 16;
    const MAX_Z = 6;

    useEffect(() => {
        // Detect if we are in World Context (Cheap/Dirty but effective for Strapi 5)
        // URL format: /content-manager/collection-types/api::world.world/:id
        const isWorldContext = window.location.pathname.includes('api::world.world');
        
        if (isWorldContext) {
            // ON-DEMAND MODE
            const worldId = window.location.pathname.split('/').pop();
            
            const loadWorldChunk = async () => {
                try {
                    // Fetch full world config first? 
                    // Ideally we should use the config from the form, but that's hard to access if dirty.
                    // We'll fetch the current World Record to get its seed/radius config.
                    const { data: worldData } = await get(`/content-manager/collection-types/api::world.world/${worldId}`);
                    
                    if (worldData) {
                        const payload = {
                            x: 0, 
                            y: 0,
                            world: worldId,
                            config: {
                                seed: worldData.seed,
                                // ... map other config fields if needed, or backend defaults 
                                // Actually, backend getChunk lifecycle uses full config. 
                                // We should pass minimal config and let backend resolve? 
                                // No, getChunk needs config object.
                                // We'll map essential noise params.
                                detail: worldData.detail,
                                roughness: worldData.roughness,
                                globalScale: worldData.globalScale,
                                // etc...
                            }
                        };
                        
                        // Call Preview Endpoint
                        // Note: We use the generic 'preview' but pass 'world' ID for persistence overlay
                        // We need access to public API or admin internal?
                        // Admin internal: Use request helper.
                        // But /api/voxel-engine/preview is a content-api route.
                        // We might need to use `fetch` or `post`.
                        // Strapi Admin `useFetchClient` -> `post`
                        try {
                             const { post } = useFetchClient(); // Ensure we have post
                             const response = await post('/voxel-engine/preview', payload);
                             if (response.data) {
                                 setChunk(response.data);
                                 return;
                             }
                        } catch(e) { 
                             console.warn("Using public preview endpoint failed, falling back or trying admin route?");
                             // Actually, standard fetch might work if route is public
                             // But we possess the token.
                             // Let's assume the route /api/voxel-engine/preview is accessible if authenticated.
                             // In Strapi 5, admin requests to /api need prefix? Usually /api...
                             // Let's try direct fetch to '/api/voxel-engine/preview'
                             const res = await fetch('/api/voxel-engine/preview', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' }, // Auth?
                                 body: JSON.stringify(payload)
                             });
                             const json = await res.json();
                             if (json) setChunk(json);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load on-demand world chunk", e);
                }
            };
            loadWorldChunk();
            return; // Skip default parsing
        }

        const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
        const loadedTiles = emptyLayers;

        if (value) {
            try {
                const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(parsedValue)) {
                    parsedValue.forEach((v: Record<string, any>) => {
                         if (v.z >= 0 && v.z <= MAX_Z && v.y >= 0 && v.y < GRID_SIZE && v.x >= 0 && v.x < GRID_SIZE) {
                             if (!loadedTiles[v.z]) loadedTiles[v.z] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
                             if (!loadedTiles[v.z][v.y]) loadedTiles[v.z][v.y] = Array(GRID_SIZE).fill(null);
                             
                             loadedTiles[v.z][v.y][v.x] = {
                                 x: v.x, y: v.y, z: v.z,
                                 block: v.block || v.type, 
                                 biome: 'custom',
                                 isWalkable: true,
                                 isTransparent: false,
                                 variant: 0,
                             };
                         }
                    });
                }
            } catch (e) {
                console.error("Failed to parse voxel data", e);
            }
        }
        setChunk({ x: 0, y: 0, tiles: loadedTiles });
    }, [value]);

    // ... (getShapePixels remains same)

    // Render Canvas
    useEffect(() => {
        if (!canvasRef.current || !chunk) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        let previewPoints: {x:number, y:number}[] = [];
        if (dragStart && dragEnd && (tool === 'rect' || tool === 'circle')) {
            previewPoints = getShapePixels(dragStart, dragEnd, tool);
        }

        RenderEngine.render(
            ctx,
            chunk,
            currentZ,
            scale,
            pan,
            terrains,
            {
                showGrid: true,
                ghostLowerLayers: true,
                preview: previewPoints.length > 0 ? {
                    points: previewPoints,
                    color: RenderEngine.getBlockColor(selectedBlock, terrains)
                } : undefined
            }
        );

    }, [chunk, currentZ, scale, pan, dragStart, dragEnd, tool, selectedBlock, terrains]);

    
    // ... (Event Handlers remain primarily the same, just keeping them in the block)
    // ... (Including handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleBrushClick, propagateChange, handleClear)
    
     const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault(); 
        const newScale = Math.max(0.5, Math.min(4, scale - e.deltaY * 0.001));
        setScale(newScale);
    };
    
    const getTileCoords = (e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        
        const localX = (e.clientX - rect.left);
        const localY = (e.clientY - rect.top);

        const cssScaleX = canvasRef.current.width / rect.width;
        const cssScaleY = canvasRef.current.height / rect.height;

        const canvasX = localX * cssScaleX;
        const canvasY = localY * cssScaleY;

        const worldX = (canvasX - pan.x) / scale;
        const worldY = (canvasY - pan.y) / scale;

        return {
            x: Math.floor(worldX / TILE_SIZE),
            y: Math.floor(worldY / TILE_SIZE)
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan' || e.button === 1) { 
            setIsPanning(true);
            setLastMouse({ x: e.clientX, y: e.clientY });
        } else if (tool === 'rect' || tool === 'circle') {
             const tile = getTileCoords(e);
             setDragStart(tile);
             setDragEnd(tile);
        } else if (tool === 'detail') {
             const tile = getTileCoords(e);
             const targetZ = currentZ;
             // Check if tile exists
             if (chunk?.tiles?.[targetZ]?.[tile.y]?.[tile.x]) {
                 setDetailTarget({ x: tile.x, y: tile.y, z: targetZ });
                 setIsPixelEditorOpen(true);
             }
        } else {
            // Brush Click
            handleBrushClick(e);
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMouse({ x: e.clientX, y: e.clientY });
        } else if ((tool === 'rect' || tool === 'circle') && dragStart) {
            const tile = getTileCoords(e);
            setDragEnd(tile);
        } else if (tool === 'brush' && e.buttons === 1) {
            // Drag draw for brush
            handleBrushClick(e);
        }
    };

     const handleMouseUp = (e: React.MouseEvent) => {
        setIsPanning(false);
        
        if ((tool === 'rect' || tool === 'circle') && dragStart && dragEnd) {
             const points = getShapePixels(dragStart, dragEnd, tool);
             const tileZ = currentZ;
             const newChunk = { ...chunk! };
             if (!newChunk.tiles) newChunk.tiles = [];
             if (!newChunk.tiles[tileZ]) newChunk.tiles[tileZ] = [];
             
             points.forEach(p => {
                 if (p.x >= 0 && p.x < 16 && p.y >= 0 && p.y < 16) {
                      if (!newChunk.tiles[tileZ][p.y]) newChunk.tiles[tileZ][p.y] = Array(16).fill(null);
                      newChunk.tiles[tileZ][p.y][p.x] = {
                         x: p.x, y: p.y, z: tileZ,
                         block: selectedBlock,
                         biome: 'custom',
                         isWalkable: true, 
                         isTransparent: false,
                         variant: 0
                     };
                 }
             });
             setChunk(newChunk);
             propagateChange(newChunk);
        }
        setDragStart(null);
        setDragEnd(null);
    };

    const handleBrushClick = (e: React.MouseEvent) => {
        if (!canvasRef.current || !chunk) return;
        const tile = getTileCoords(e);
        const { x: tileX, y: tileY } = tile;
        const tileZ = currentZ;

        if (tileX >= 0 && tileX < 16 && tileY >= 0 && tileY < 16 && tileZ >= 0 && tileZ < 16) {
             const newChunk = { ...chunk };
             if (!newChunk.tiles) newChunk.tiles = [];
             if (!newChunk.tiles[tileZ]) newChunk.tiles[tileZ] = [];
             if (!newChunk.tiles[tileZ][tileY]) newChunk.tiles[tileZ][tileY] = Array(16).fill(null);
             
             newChunk.tiles[tileZ][tileY][tileX] = {
                 x: tileX, y: tileY, z: tileZ,
                 block: selectedBlock,
                 biome: 'custom',
                 isWalkable: true, 
                 isTransparent: false,
                 variant: 0
             };
             
             setChunk(newChunk);
             propagateChange(newChunk);
        }
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

    const handleClear = () => {
         const emptyLayers = Array(16).fill(null).map(() => Array(16).fill(null).map(() => Array(16).fill(null)));
         const newChunk = { x: 0, y: 0, tiles: emptyLayers };
         setChunk(newChunk);
         propagateChange(newChunk);
    };



    const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel?.defaultMessage || name);

    return (
        <>
        <Box>
            <Flex gap={2} alignItems="center">
                 <Typography variant="pi" fontWeight="bold">{label}</Typography>
                 <span title="Each cell is 1ft². Layers (Z) are independent instances; there is no physics elevation calculation between them.">
                    <Information aria-label="Info about depth" />
                 </span>
            </Flex>
            
            <Box paddingTop={2}>
                 <Grid.Root gap={4}>
                     <Grid.Item col={9} s={12}>
                        
                        {/* Toolbar */}
                        <Flex gap={2} paddingBottom={2}>
                            <Button 
                                variant={tool === 'brush' ? 'default' : 'secondary'} 
                                onClick={() => setTool('brush')}
                                startIcon={<Pencil />}
                                size="S"
                            >
                                Draw
                            </Button>
                             <Button 
                                variant={tool === 'rect' ? 'default' : 'secondary'} 
                                onClick={() => setTool('rect')}
                                startIcon={<Crop />}
                                size="S"
                            >
                                Rect
                            </Button>
                             <Button 
                                variant={tool === 'circle' ? 'default' : 'secondary'} 
                                onClick={() => setTool('circle')}
                                startIcon={<ChartCircle />}
                                size="S"
                            >
                                Circle
                            </Button>
                             <Button 
                                variant={tool === 'detail' ? 'default' : 'secondary'} 
                                onClick={() => setTool('detail')}
                                startIcon={<Pencil />} 
                                size="S"
                            >
                                Detail
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
                            style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', width: '100%', minHeight: '600px' }}
                        >
                            <canvas 
                                ref={canvasRef} 
                                width={800} 
                                height={800}
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ 
                                    width: '100%', 
                                    maxWidth: 'none', // Full width
                                    height: 'auto',
                                    aspectRatio: '1',
                                    cursor: tool === 'pan' ? 'grab' : 'crosshair', 
                                    imageRendering: 'pixelated' 
                                }} 
                            />
                        </Box>
                     </Grid.Item>
                     <Grid.Item col={3} s={12}>
                         <Box>
                            <Typography variant="sigma">Depth / Level ({currentZ - 3})</Typography>
                             <Flex gap={2} paddingTop={2} paddingBottom={4}>
                                <Button 
                                    disabled={currentZ <= 0} 
                                    onClick={() => setCurrentZ(z => Math.max(0, z - 1))}
                                    size="S"
                                    variant="secondary"
                                >
                                    Down
                                </Button>
                                <Button 
                                    disabled={currentZ >= 6} 
                                    onClick={() => setCurrentZ(z => Math.min(6, z + 1))}
                                    size="S"
                                    variant="secondary"
                                >
                                    Up
                                </Button>
                            </Flex>

                            <SingleSelect 
                                label="Block"
                                size="S"
                                value={selectedBlock} 
                                onChange={setSelectedBlock}
                            >
                                {terrains.length > 0 ? terrains.map((t: any) => (
                                    <SingleSelectOption key={t.slug} value={t.slug}>
                                        <Flex gap={2}>
                                            <Box background={t.color} width="12px" height="12px" hasRadius />
                                            {t.name}
                                        </Flex>
                                    </SingleSelectOption>
                                )) : BLOCK_TYPES.map(type => (
                                    <SingleSelectOption key={type} value={type}>{type}</SingleSelectOption>
                                ))}
                            </SingleSelect>
                            

                         </Box>
                     </Grid.Item>
                 </Grid.Root>
            </Box>
        </Box>
        
        {isPixelEditorOpen && detailTarget && chunk && chunk.tiles[detailTarget.z]?.[detailTarget.y]?.[detailTarget.x] && (
            <PixelEditor 
                initialPixels={chunk.tiles[detailTarget.z][detailTarget.y][detailTarget.x]?.pixels}
                baseColor={RenderEngine.getBlockColor(chunk.tiles[detailTarget.z][detailTarget.y][detailTarget.x]?.block || 'stone', terrains)}
                onClose={() => setIsPixelEditorOpen(false)}
                onSave={(pixels) => {
                    if (!chunk || !detailTarget) return;
                    const newChunk = { ...chunk };
                    const t = newChunk.tiles[detailTarget.z][detailTarget.y][detailTarget.x];
                    if (t) {
                        t.pixels = pixels;
                        setChunk(newChunk);
                        propagateChange(newChunk);
                    }
                    setIsPixelEditorOpen(false);
                }}
            />
        )}
        </>
    );
});
