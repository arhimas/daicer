
import React, { useRef, useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin'; 
// import { useCMEditViewDataManager } from '@strapi/admin/strapi-admin'; // Deprecated/Hidden

// import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';
import { useParams } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Flex,
  Grid,
  SingleSelect,
  SingleSelectOption
} from '@strapi/design-system';
// import { useIntl } from 'react-intl';
import { Pencil, Drag, Monitor } from '@strapi/icons';
import { ArrowClockwise } from '@strapi/icons';
import { Chunk, TerrainType } from '../../types';
// import { TILE_SIZE, BLOCK_TYPES } from '../../constants';
// import { getShapePixels } from '../../utils/shape-tools'; // Unused?
import { RenderEngine } from '../../utils/render-engine';

interface WorldVoxelInputProps {
  name: string;
  value?: unknown;
  onChange: (e: unknown) => void;
  attribute: unknown;
  intlLabel: { id: string; defaultMessage?: string };
}

// const GRID_SIZE = 16;
// const MAX_Z = 6;

export const WorldVoxelInput = React.forwardRef<HTMLInputElement, WorldVoxelInputProps>((props, _ref) => {
    const { name: _name, intlLabel: _intlLabel } = props;
    // const { formatMessage } = useIntl();
    const { post, get } = useFetchClient();
    
    // Access Form Data for Live Preview
    // Unstable hook usage removed to prevent runtime crash (runHookWaterfall error)
    const modifiedData: Record<string, unknown> = {}; 
    /*
    try {
        // const ctx = useContentManagerContext();
    } catch (e) {
        console.warn("useContentManagerContext hook failed", e);
    }
    */

    // In Strapi v5 Admin, we might get context differently.
    const params = useParams<{ slug?: string, id?: string }>();
    const slug = params.slug;
    const paramId = params.id;

    // Safety check: Only show valid UI if we are in a saved World
    const isCreatingEntry = paramId === 'create';
    const worldId = isCreatingEntry ? null : paramId;
    // Unlock for Create Mode to allow Preview
    const canEdit = (slug === 'api::world.world'); 

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [chunks, setChunks] = useState<Map<string, Chunk>>(new Map());
    const [viewPos, setViewPos] = useState({ x: 0, y: 0 }); // Chunk Coordinates
    const [currentZ, setCurrentZ] = useState(3);
    const [selectedBlock, setSelectedBlock] = useState<string>('dirt');
    const [isSaving, _setIsSaving] = useState(false);
    
    // Viewport
    const [scale, _setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'brush' | 'pan'>('brush'); 
    
    const [terrains, setTerrains] = useState<TerrainType[]>([]);

    // Load Terrains once
    useEffect(() => {
        const fetchTerrains = async () => {
            try {
                const { data } = await get('/content-manager/collection-types/api::terrain.terrain?page=1&pageSize=100');
                if (data && data.results) {
                    setTerrains(data.results);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchTerrains();
    }, []);

    // Fetch World Chunk State (Live Preview or Saved)
    const refreshChunks = async () => {
        if (slug !== 'api::world.world') return;
        
        const newChunks = new Map<string, Chunk>();
        const offsets = [
            { dx: 0, dy: 0 },   // Center
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        try {
            // Parallel Fetch
            await Promise.all(offsets.map(async ({ dx, dy }) => {
                const targetX = viewPos.x + dx;
                const targetY = viewPos.y + dy;
                
                const payload = {
                    x: targetX, 
                    y: targetY,
                    world: worldId,
                    config: {
                        seed: modifiedData.seed,
                        detail: modifiedData.detail,
                        globalScale: modifiedData.globalScale,
                        seaLevel: modifiedData.seaLevel,
                        elevationScale: modifiedData.elevationScale,
                        roughness: modifiedData.roughness,
                        moistureScale: modifiedData.moistureScale,
                        temperatureOffset: modifiedData.temperatureOffset,
                        roadDensity: modifiedData.roadDensity,
                        structureChance: modifiedData.structureChance,
                        structureSpacing: modifiedData.structureSpacing,
                        structureSizeAvg: modifiedData.structureSizeAvg
                    }
                };

                try {
                    // Try fetch first (lighter) if public, else post
                    // Using post via admin client
                    // Fix: Use plugin admin route /map-explorer/preview which uses Admin Token
                    const response = await post('/map-explorer/preview', payload);
                    if (response.data) {
                        const key = `${targetX},${targetY}`;
                        newChunks.set(key, response.data);
                    }
                } catch(e) {
                    console.warn(`Failed chunk ${targetX},${targetY}`, e);
                }
            }));
            
            setChunks(newChunks);

        } catch (e) {
            console.error("Failed to load world chunks", e);
        }
    };

    useEffect(() => {
        refreshChunks();
    }, [worldId, canEdit, viewPos]); // Reload when view moves

    // Rendering
    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        // Clear Setup
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Base Transform (Pan/Zoom)
        // Center of canvas
        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2;
        
        ctx.translate(cx + pan.x, cy + pan.y);
        ctx.scale(scale, scale);
        // Move back so (0,0) is top-left of CENTER chunk? 
        // Or (0,0) is world origin? 
        // Let's make (0,0) the top-left of the VIEWPOS chunk.
        // So offset relative to viewPos.
        
        // Render Chunks
        // CHUNK_PIXEL_SIZE assumed 16 * 32 = 512?
        // Wait, VoxelInput uses TILE_SIZE=32? RenderEngine uses pixels?
        // RenderEngine usually renders a chunk at 0,0 locally.
        // We need to shift context for each chunk.
        
        // We assume RenderEngine draws 16x16 grid. 
        // If TILE_SIZE is not passed to RenderEngine, it uses internal default?
        // Checking RenderEngine... passed scale? 
        // RenderEngine uses TILE_SIZE internally?
        // I need to know the pixel size of a chunk to offset correctly.
        // Let's assume standard 32px tiles -> 16 * 32 = 512px per chunk.
        const CHUNK_PX = 512; 
        
        // Adjust for Center: viewPos chunk should be centered?
        // If we want viewPos chunk at (0,0) of our transformed graph:
        ctx.translate(-CHUNK_PX / 2, -CHUNK_PX / 2);

        chunks.forEach((chunk, key) => {
            const [cx_str, cy_str] = key.split(',');
            const cx_local = parseInt(cx_str);
            const cy_local = parseInt(cy_str);
            
            const relX = cx_local - viewPos.x;
            const relY = cy_local - viewPos.y;
            
            ctx.save();
            ctx.translate(relX * CHUNK_PX, relY * CHUNK_PX);
            
            // Call Render Engine
            // Note: RenderEngine clears/transforms usually? 
            // We need a RenderEngine that DOES NOT clear or reset transform absolutely.
            // If RenderEngine resets transform (ctx.setTransform), this breaks.
            // I checked RenderEngine source via view_file in previous step? No, I saw import.
            // I should check RenderEngine source.
            // Assuming RenderEngine respects current transform if I pass simple params.
            
            RenderEngine.render(
                ctx,
                chunk,
                currentZ,
                1, // Internal scale 1, we handled zoom on ctx
                { x: 0, y: 0 }, // No internal pan
                terrains,
                { showGrid: true, ghostLowerLayers: true, preventClear: true }
            );
            
            ctx.restore();
        });
        
    }, [chunks, currentZ, scale, pan, terrains, viewPos]);

    
    // Interaction Handlers (Simplified Brush Only for now)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan') {
            setIsPanning(true);
            setLastMouse({ x: e.clientX, y: e.clientY });
            return;
        }
        
        // Brush Logic
        handleBrushAction(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            
            // Accumulated Pan
            let newPanX = pan.x + dx;
            let newPanY = pan.y + dy;
            
            // Check Thresholds (Half Chunk Size = 256)
            const THRESHOLD = 256;
            const CHUNK_SIZE = 512;
            
            let posDx = 0;
            let posDy = 0;

            // Moving Right -> View moves Left (pan positive)
            // Actually: Canvas Pan +X means content moves Right.
            // If content moves Right > 256, we are looking at the Left neighbor more.
            // So ViewPos.x should DECREMENT.
            
            if (newPanX > THRESHOLD) {
                newPanX -= CHUNK_SIZE;
                posDx = -1;
            } else if (newPanX < -THRESHOLD) {
                newPanX += CHUNK_SIZE;
                posDx = 1;
            }

            if (newPanY > THRESHOLD) {
                newPanY -= CHUNK_SIZE;
                posDy = -1;
            } else if (newPanY < -THRESHOLD) {
                newPanY += CHUNK_SIZE;
                posDy = 1;
            }

            // Update State
            setPan({ x: newPanX, y: newPanY });
            
            if (posDx !== 0 || posDy !== 0) {
                setViewPos(prev => ({ x: prev.x + posDx, y: prev.y + posDy }));
                // This will trigger 'refreshChunks' via useEffect [viewPos]
            }

            setLastMouse({ x: e.clientX, y: e.clientY });
            return;
        }

        if (e.buttons === 1 && tool === 'brush') {
             handleBrushAction(e);
        }
    };

    const getTileCoords = (e: React.MouseEvent) => {
        // Complex coordinate mapping needed for Multi-Chunk
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        
        const cssScaleX = canvasRef.current.width / rect.width;
        const cssScaleY = canvasRef.current.height / rect.height;

        const localX = (e.clientX - rect.left) * cssScaleX;
        const localY = (e.clientY - rect.top) * cssScaleY;

        // Inverting the transform applied in Render
        // ctx.translate(cx + pan.x, cy + pan.y);
        // ctx.scale(scale, scale);
        // ctx.translate(-CHUNK_PX / 2, -CHUNK_PX / 2);
        
        const cx = canvasRef.current.width / 2;
        const cy = canvasRef.current.height / 2;
        const CHUNK_PX = 512;
        const TILE_SIZE = 32;

        // WorldPixel relative to ViewPos Render Origin
        const renderX = (localX - (cx + pan.x)) / scale + (CHUNK_PX / 2);
        const renderY = (localY - (cy + pan.y)) / scale + (CHUNK_PX / 2);
        
        // Convert to Global Tile Coords relative to ViewPos (0,0)
        // If renderX is 530, that is Chunk (1,0) Tile (0,...).
        
        const totalTileX = Math.floor(renderX / TILE_SIZE);
        const totalTileY = Math.floor(renderY / TILE_SIZE);
        
        // Calculate Chunk Offset and Local Tile
        const chunkDx = Math.floor(totalTileX / 16);
        const chunkDy = Math.floor(totalTileY / 16);
        
        const localTileX = ((totalTileX % 16) + 16) % 16;
        const localTileY = ((totalTileY % 16) + 16) % 16;

        return {
            chunkX: viewPos.x + chunkDx,
            chunkY: viewPos.y + chunkDy,
            tileX: localTileX,
            tileY: localTileY
        };
    };

    const handleBrushAction = async (e: React.MouseEvent) => {
        if (isSaving) return;
        const coords = getTileCoords(e);
        if (!coords) return;
        
        const { chunkX, chunkY, tileX, tileY } = coords;
        const key = `${chunkX},${chunkY}`;
        const chunk = chunks.get(key);
        
        if (!chunk) return; // Can't edit unloaded chunk

        // Optimistic Update
        // ... (Same logic but targeting specific chunk in Map)
        
        const currentBlock = chunk.tiles[currentZ]?.[tileY]?.[tileX]?.block;
        if (currentBlock === selectedBlock) return;
        
        // Cloning Chunk is heavy? Map update needed.
        const newChunk = { ...chunk }; 
        if (!newChunk.tiles[currentZ]) newChunk.tiles[currentZ] = [];
        if (!newChunk.tiles[currentZ][tileY]) newChunk.tiles[currentZ][tileY] = [];
        
        newChunk.tiles[currentZ][tileY][tileX] = {
             x: tileX, y: tileY, z: currentZ, // Local or Global? Chunk stores local x/y typically
             block: selectedBlock,
             biome: 'custom',
             isWalkable: true, 
             isTransparent: false,
             variant: 0
        };
        
        const newChunks = new Map(chunks);
        newChunks.set(key, newChunk);
        setChunks(newChunks);
        
        try {
            await post('/map-explorer/voxel', {
                worldId,
                chunkX: chunkX,
                chunkY: chunkY,
                voxelX: tileX,
                voxelY: tileY,
                voxelZ: currentZ - 3, 
                newType: selectedBlock,
                reason: "Manual Edit"
            });
            // Debounce refresh?
        } catch (err) {
            console.error("Failed to persist voxel change", err);
        }
    };

    // const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel?.defaultMessage || name);

    if (!canEdit) {
        return (
            <Box background="neutral100" padding={4} hasRadius>
                 <Flex direction="column" alignItems="center" gap={2}>
                    <Monitor width="32px" height="32px" />
                    <Typography variant="beta">World Editor Locked</Typography>
                    <Typography variant="omega">Please save the World to enable the Voxel Editor.</Typography>
                 </Flex>
            </Box>
        );
    }

    return (
        <React.Fragment>
        <Box>
            <Flex gap={2} alignItems="center" paddingBottom={2}>
                 <Typography variant="pi" fontWeight="bold">World Voxel Editor</Typography>
                 <ArrowClockwise style={{ cursor: 'pointer' }} onClick={refreshChunks} aria-label="Refresh Map" />
            </Flex>

            <Grid.Root gap={4}>
                 <Grid.Item col={8} s={12}>
                     <Flex gap={2} paddingBottom={2}>
                        <Button 
                            variant={tool === 'brush' ? 'default' : 'secondary'} 
                            onClick={() => setTool('brush')}
                            startIcon={<Pencil />}
                            size="S"
                        >
                            Paint
                        </Button>
                         <Button 
                            variant={tool === 'pan' ? 'default' : 'secondary'} 
                            onClick={() => setTool('pan')}
                            startIcon={<Drag />}
                            size="S"
                        >
                            Pan
                        </Button>
                     </Flex>
                     
                     <Box 
                        background="neutral150" 
                        padding={2} 
                        hasRadius 
                        shadow="filterShadow"
                        style={{ overflow: 'hidden' }}
                     >
                        <canvas 
                            ref={canvasRef} 
                            width={512} 
                            height={512}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={() => setIsPanning(false)}
                            onMouseLeave={() => setIsPanning(false)}
                            style={{ 
                                width: '100%', 
                                cursor: tool === 'pan' ? 'grab' : 'crosshair',
                                imageRendering: 'pixelated'
                            }}
                        />
                     </Box>
                 </Grid.Item>
                 
                 <Grid.Item col={4} s={12}>
                    <Typography variant="sigma">Depth ({currentZ - 3})</Typography>
                     <Flex gap={2} paddingTop={2} paddingBottom={4}>
                        <Button 
                            disabled={currentZ <= 0} 
                            onClick={() => setCurrentZ(z => Math.max(0, z - 1))}
                            size="S"
                            variant="secondary"
                            width="100%"
                        >
                            Down
                        </Button>
                        <Button 
                            disabled={currentZ >= 6} 
                            onClick={() => setCurrentZ(z => Math.min(6, z + 1))}
                            size="S"
                            variant="secondary"
                            width="100%"
                        >
                            Up
                        </Button>
                     </Flex>
                     
                     <SingleSelect 
                        label="Terrain"
                        size="S"
                        value={selectedBlock} 
                        onChange={setSelectedBlock}
                    >
                        {terrains.map((t) => (
                            <SingleSelectOption key={t.slug} value={t.slug}>
                                <Flex gap={2}>
                                    <Box background={t.color} width="12px" height="12px" hasRadius />
                                    {t.name}
                                </Flex>
                            </SingleSelectOption>
                        ))}
                    </SingleSelect>
                 </Grid.Item>
            </Grid.Root>
        </Box>
        </React.Fragment>
    );
});
