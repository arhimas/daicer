
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin'; 
// import { useCMEditViewDataManager } from '@strapi/admin/strapi-admin'; // Deprecated/Hidden

import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';
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
import { useIntl } from 'react-intl';
import { Pencil, Drag, Crop, ChartCircle, Trash, Monitor } from '@strapi/icons';
import { ArrowClockwise } from '@strapi/icons';
import { BlockType, Chunk, TerrainType } from '../../types';
import { TILE_SIZE, BLOCK_TYPES } from '../../constants';
// import { getShapePixels } from '../../utils/shape-tools'; // Unused?
import { RenderEngine } from '../../utils/render-engine';

interface WorldVoxelInputProps {
  name: string;
  value?: any;
  onChange: (e: any) => void;
  attribute: any;
  intlLabel: any;
}

const GRID_SIZE = 16;
const MAX_Z = 6;

export const WorldVoxelInput = React.forwardRef<HTMLInputElement, WorldVoxelInputProps>((props, _ref) => {
    const { name, intlLabel } = props;
    const { formatMessage } = useIntl();
    const { post, get } = useFetchClient();
    
    // Access Form Data for Live Preview
    let modifiedData: any = {};
    try {
        const ctx: any = useContentManagerContext();
        if (ctx && ctx.form) {
            modifiedData = ctx.form.values;
        }
    } catch (e) {
        console.warn("useContentManagerContext hook failed", e);
    }

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
    const [chunk, setChunk] = useState<Chunk | null>(null);
    const [currentZ, setCurrentZ] = useState(3);
    const [selectedBlock, setSelectedBlock] = useState<string>('dirt');
    const [isSaving, setIsSaving] = useState(false);
    
    // Viewport
    const [scale, setScale] = useState(1);
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
    const refreshChunk = async () => {
        // if (!canEdit) return; // Allow preview even if locked? No, only allow if slug matches.
        if (slug !== 'api::world.world') return;

        try {
            // Live Preview Logic: Use Form Data
            const payload = {
                x: 0, 
                y: 0,
                world: worldId, // null if creating
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

            const response = await post('/voxel-engine/preview', payload);
            if (response.data) {
                setChunk(response.data);
            }
        } catch (e) {
            console.error("Failed to load world chunk", e);
        }
    };

    useEffect(() => {
        refreshChunk();
    }, [worldId, canEdit]); // Initial Load. Manual refresh via button for updates.


    // Rendering
    useEffect(() => {
        if (!canvasRef.current || !chunk) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        RenderEngine.render(
            ctx,
            chunk,
            currentZ,
            scale,
            pan,
            terrains,
            { showGrid: true, ghostLowerLayers: true }
        );
    }, [chunk, currentZ, scale, pan, terrains]);

    
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
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMouse({ x: e.clientX, y: e.clientY });
            return;
        }

        if (e.buttons === 1 && tool === 'brush') {
             handleBrushAction(e);
        }
    };

    const getTileCoords = (e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        
        // Compute scale relative to canvas internal res vs css size
        const cssScaleX = canvasRef.current.width / rect.width;
        const cssScaleY = canvasRef.current.height / rect.height;

        const localX = (e.clientX - rect.left) * cssScaleX;
        const localY = (e.clientY - rect.top) * cssScaleY;

        const worldX = (localX - pan.x) / scale;
        const worldY = (localY - pan.y) / scale;

        return {
            x: Math.floor(worldX / 32), // TILE_SIZE=32 implied here? Original code imported TILE_SIZE but used hardcoded/imported values. Re-adding import.
            y: Math.floor(worldY / 32)
        };
    };

    const handleBrushAction = async (e: React.MouseEvent) => {
        if (!chunk || isSaving) return;
        const { x, y } = getTileCoords(e);
        
        // Bounds Check (Hardcoded 16 for now, but World might be bigger!)
        // Actually, getChunk 0,0 usually returns ONE chunk of size 16x16.
        if (x < 0 || x >= 16 || y < 0 || y >= 16) return;

        // Current voxel check to avoid spam
        const currentBlock = chunk.tiles[currentZ]?.[y]?.[x]?.block;
        if (currentBlock === selectedBlock) return;

        // Optimistic Update
        const newChunk = { ...chunk };
        if (!newChunk.tiles[currentZ]) newChunk.tiles[currentZ] = [];
        if (!newChunk.tiles[currentZ][y]) newChunk.tiles[currentZ][y] = [];
        // Ensure tiles array structure exists
        
        // We set it visually
        // (Visual update deferred to re-fetch/confirmation to be robust, or we can deep clone)
        // Let's just fire API. "Live" Voxel Change.
        
        try {
            await post('/map-explorer/voxel', {
                worldId,
                chunkX: 0,
                chunkY: 0,
                voxelX: x,
                voxelY: y,
                voxelZ: currentZ - 3, // Convert display Z (0..6) to logic Z (-3..3)
                newType: selectedBlock,
                reason: "Manual Edit"
            });
            
            // Re-fetch to confirm state (or optimize later)
            // Just refresh for now to ensure consistency
            refreshChunk(); 
        } catch (err) {
            console.error("Failed to persist voxel change", err);
        }
    };

    const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel?.defaultMessage || name);

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
                 <ArrowClockwise style={{ cursor: 'pointer' }} onClick={refreshChunk} aria-label="Refresh Map" />
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
                        {terrains.map((t: any) => (
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
