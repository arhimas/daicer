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
  // IconButton
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Trash, Drag, Pencil, Crop, ChartCircle, Information, Magic } from '@strapi/icons';
import { Chunk, TerrainType } from '../../types';
import { TILE_SIZE, BLOCK_TYPES } from '../../constants';
import { getShapePixels } from '../../utils/shape-tools';
import { RenderEngine } from '../../utils/render-engine';


// Internal constants for this component to match user expectations
// const DISPLAY_Z_MIN = -3;
// const DISPLAY_Z_MAX = 3;
// const TOTAL_LAYERS = 7; 

interface VoxelInputProps {
  name: string;
  value?: string | null;
  onChange: (e: { target: { name: string; value: unknown; type: string } }) => void;
  attribute: { type: string; customField: string; options?: { size?: number } };
  intlLabel: { id: string; defaultMessage?: string };
}



export const VoxelInput = React.forwardRef<HTMLInputElement, VoxelInputProps>((props, _ref) => { // Ref is forwarded but not used locally
    const { name, value, onChange, attribute, intlLabel } = props;
    const { formatMessage } = useIntl();
    const { get, post } = useFetchClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Dynamic Grid Size
    const DEFAULT_SIZE = 16;
    const gridSize = attribute.options?.size || DEFAULT_SIZE;

    const [chunk, setChunk] = useState<Chunk | null>(null);
    const [currentZ, setCurrentZ] = useState(3); 
    const [selectedBlock, setSelectedBlock] = useState<string>('stone');
    const [terrains, setTerrains] = useState<TerrainType[]>([]);

    // Viewport State
    const [scale, setScale] = useState(800 / (gridSize * TILE_SIZE) * 0.8); // Auto-fit to canvas with margin
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'brush' | 'pan' | 'rect' | 'circle'>('brush');
    
    // Shape Drag State
    const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
    const [dragEnd, setDragEnd] = useState<{x: number, y: number} | null>(null);

    // AI Architect State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("gemini-1.5-flash-latest");
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'queued'|'active'|'completed'|'failed'|null>(null);

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

    // Polling System (AI)
    useEffect(() => {
        if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return;
        
        const poll = async () => {
            try {
                const { data } = await get(`/map-explorer/forge/status/${jobId}`);
                setJobStatus(data.state);
                
                if (data.state === 'completed' && data.result) {
                    if (data.result.voxelData) {
                         // Parse Voxel Data into Chunk
                         const newChunk = parseVoxelDataToChunk(data.result.voxelData, gridSize);
                         setChunk(newChunk);
                         propagateChange(newChunk);
                    }
                    setIsGenerating(false);
                    setJobId(null);
                    setIsModalOpen(false); // Close on success
                } else if (data.state === 'failed') {
                    setIsGenerating(false);
                    setJobId(null);
                }
            } catch (err) {
                console.error("Poll Error", err);
            }
        };

        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, [jobId, jobStatus, gridSize, get]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setJobStatus('queued');
        try {
             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt, 
                 type: 'Construction', 
                 action: 'generate_voxel',
                 width: gridSize,
                 model,
                 entityData: { gridSize } // Context
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (_err) {
            console.error("Dispatch Error", _err);
            setIsGenerating(false);
            setJobStatus('failed');
        }
    };

    const parseVoxelDataToChunk = (voxels: any[], size: number): Chunk => {
        const MAX_Z = 6;
        const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(size).fill(null).map(() => Array(size).fill(null)));
        const loadedTiles = emptyLayers;

        voxels.forEach((v: any) => {
             if (v.z >= 0 && v.z <= MAX_Z && v.y >= 0 && v.y < size && v.x >= 0 && v.x < size) {
                 if (!loadedTiles[v.z]) loadedTiles[v.z] = Array(size).fill(null).map(() => Array(size).fill(null));
                 if (!loadedTiles[v.z][v.y]) loadedTiles[v.z][v.y] = Array(size).fill(null);
                 
                 loadedTiles[v.z][v.y][v.x] = {
                     x: v.x, y: v.y, z: v.z,
                     block: v.block || 'stone', 
                     biome: 'custom',
                     isWalkable: true,
                     isTransparent: false,
                     variant: 0,
                 };
             }
        });
        return { x: 0, y: 0, tiles: loadedTiles };
    };


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
                    const { data: worldData } = await get(`/content-manager/collection-types/api::world.world/${worldId}`);
                    
                    if (worldData) {
                        const payload = {
                            x: 0, 
                            y: 0,
                            world: worldId,
                            config: {
                                seed: worldData.seed,
                                detail: worldData.detail,
                                roughness: worldData.roughness,
                                globalScale: worldData.globalScale,
                            }
                        };
                        
                        try {
                             const { post } = useFetchClient(); // Ensure we have post
                             const response = await post('/map-explorer/preview', payload);
                             if (response.data) {
                                 setChunk(response.data);
                                 return;
                             }
                        } catch(_e) { 
                             console.warn("Using public preview endpoint failed, falling back or trying admin route?");
                             const res = await fetch('/map-explorer/preview', {
                                 method: 'POST',
                                 headers: { 
                                     'Content-Type': 'application/json',
                                 }, 
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

        const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
        const loadedTiles = emptyLayers;

        if (value) {
            try {
                const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(parsedValue)) {
                    parsedValue.forEach((v: { x: number; y: number; z: number; block?: string; type?: string }) => {
                         if (v.z >= 0 && v.z <= MAX_Z && v.y >= 0 && v.y < gridSize && v.x >= 0 && v.x < gridSize) {
                             if (!loadedTiles[v.z]) loadedTiles[v.z] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
                             if (!loadedTiles[v.z][v.y]) loadedTiles[v.z][v.y] = Array(gridSize).fill(null);
                             
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
            } catch (_e) {
                console.error("Failed to parse voxel data", _e);
            }
        }
        setChunk({ x: 0, y: 0, tiles: loadedTiles });
    }, [value, gridSize]);

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

     const handleMouseUp = (_e: React.MouseEvent) => {
        setIsPanning(false);
        
        if ((tool === 'rect' || tool === 'circle') && dragStart && dragEnd) {
             const points = getShapePixels(dragStart, dragEnd, tool);
             const tileZ = currentZ;
             const newChunk = { ...chunk! };
             if (!newChunk.tiles) newChunk.tiles = [];
             if (!newChunk.tiles[tileZ]) newChunk.tiles[tileZ] = [];
             
             points.forEach(p => {
                 if (p.x >= 0 && p.x < gridSize && p.y >= 0 && p.y < gridSize) { // Use gridSize
                      if (!newChunk.tiles[tileZ][p.y]) newChunk.tiles[tileZ][p.y] = Array(gridSize).fill(null);
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

        if (tileX >= 0 && tileX < gridSize && tileY >= 0 && tileY < gridSize && tileZ >= 0 && tileZ <= MAX_Z) {
             const newChunk = { ...chunk };
             if (!newChunk.tiles) newChunk.tiles = [];
             if (!newChunk.tiles[tileZ]) newChunk.tiles[tileZ] = [];
             if (!newChunk.tiles[tileZ][tileY]) newChunk.tiles[tileZ][tileY] = Array(gridSize).fill(null);
             
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
         const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
         const newChunk = { x: 0, y: 0, tiles: emptyLayers };
         setChunk(newChunk);
         propagateChange(newChunk);
    };



    const label = intlLabel?.id ? formatMessage(intlLabel) : (intlLabel?.defaultMessage || name);

    return (
        <>
        <Box>
            <Flex gap={2} alignItems="center" justifyContent="space-between">
                 <Flex gap={2}>
                    <Typography variant="pi" fontWeight="bold">{label}</Typography>
                    <span title="Each cell is 1ft². Layers (Z) are independent instances;">
                        <Information aria-label="Info about depth" />
                    </span>
                 </Flex>
                 <Button 
                    startIcon={<Magic />} 
                    variant="tertiary" 
                    size="S" 
                    onClick={() => setIsModalOpen(true)}
                 >
                    AI Architect
                 </Button>
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
                                {terrains.length > 0 ? terrains.map((t) => (
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
        
        {/* AI Architect Modal */}
        {isModalOpen && (
            <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={100} background="neutral100" style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box background="neutral0" padding={6} hasRadius shadow="popupShadow" style={{ maxWidth: '500px', width: '90%' }}>
                    <Typography variant="beta">Voxel Architect</Typography>
                    <Box paddingTop={4}>
                        <textarea 
                            style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Describe the structure (e.g. 'Ruined Stone Tower with moss')"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </Box>
                    <Box paddingTop={4}>
                         <SingleSelect 
                            label="Model" 
                            value={model} 
                            onChange={setModel}
                        >
                            <SingleSelectOption value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Fast)</SingleSelectOption>
                            <SingleSelectOption value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Quality)</SingleSelectOption>
                        </SingleSelect>
                    </Box>
                    <Flex gap={2} paddingTop={6} justifyContent="flex-end">
                        <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            startIcon={<Magic />} 
                            onClick={handleGenerate} 
                            loading={isGenerating} 
                            disabled={!prompt}
                        >
                            Generate
                        </Button>
                    </Flex>
                </Box>
            </Box>
        )}
        </>
    );
});
