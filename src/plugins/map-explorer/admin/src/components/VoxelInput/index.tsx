import React, { useRef, useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin'; 
import { 
  Box, 
  Typography, 
  Button, 
  Flex,
  SingleSelect,
  SingleSelectOption,
  Textarea
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Trash, Drag, Pencil, Crop, ChartCircle, Information, Magic, Code, Check } from '@strapi/icons';
import { Chunk, TerrainType } from '../../types';
import { TILE_SIZE, BLOCK_TYPES } from '../../constants';
import { getShapePixels } from '../../utils/shape-tools';
import { RenderEngine } from '../../utils/render-engine';

interface VoxelInputProps {
  name: string;
  value?: string | null;
  onChange: (e: { target: { name: string; value: unknown; type: string } }) => void;
  attribute: { type: string; customField: string; options?: { size?: number } };
  intlLabel: { id: string; defaultMessage?: string };
}

export const VoxelInput = React.forwardRef<HTMLInputElement, VoxelInputProps>((props, _ref) => { 
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
    const [model, setModel] = useState("gemini-3-flash-preview"); // Default Gemini 3 Flash
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'queued'|'active'|'completed'|'failed'|null>(null);

    // Data I/O State
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [dataJson, setDataJson] = useState("");

    // Fetch Terrains
    useEffect(() => {
        const fetchTerrains = async () => {
            try {
                const { data } = await get('/content-manager/collection-types/api::terrain.terrain?page=1&pageSize=100&populate=*');
                if (data && data.results) {
                    setTerrains(data.results);
                    if (data.results.length > 0) {
                        setSelectedBlock(data.results[0].slug); 
                    }
                }
            } catch (err) {
                console.error("Failed to fetch terrains", err);
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
                         const newChunk = parseVoxelDataToChunk(data.result.voxelData, gridSize);
                         setChunk(newChunk);
                         propagateChange(newChunk);
                    }
                    setIsGenerating(false);
                    setJobId(null);
                    setIsModalOpen(false); 
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
             // Pass mapped model or direct model ID from state (which should be the ID)
             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt, 
                 type: 'Construction', 
                 action: 'generate_voxel',
                 width: gridSize,
                 model,
                 entityData: { gridSize } 
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (_err) {
            console.error("Dispatch Error", _err);
            setIsGenerating(false);
            setJobStatus('failed');
        }
    };

    interface ParsedVoxel { x: number; y: number; z: number; [key: string]: unknown }
    const parseVoxelDataToChunk = (voxels: ParsedVoxel[], size: number): Chunk => {
        const MAX_Z = 6;
        const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(size).fill(null).map(() => Array(size).fill(null)));
        const loadedTiles = emptyLayers;

        voxels.forEach((v: ParsedVoxel) => {
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
        const isWorldContext = window.location.pathname.includes('api::world.world');
        
        if (isWorldContext) {
            // ON-DEMAND MODE (Skip logic same as before)
            const worldId = window.location.pathname.split('/').pop();
            const loadWorldChunk = async () => {
                try {
                    const { data: worldData } = await get(`/content-manager/collection-types/api::world.world/${worldId}`);
                    if (worldData) {
                        const payload = {
                            x: 0, y: 0, world: worldId,
                            config: {
                                seed: worldData.seed,
                                detail: worldData.detail,
                                roughness: worldData.roughness,
                                globalScale: worldData.globalScale,
                            }
                        };
                         try {
                                const response = await post('/map-explorer/preview', payload);
                                if (response.data) { setChunk(response.data); return; }
                        } catch(_e) { 
                                const res = await fetch('/map-explorer/preview', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json'}, 
                                    body: JSON.stringify(payload)
                                });
                                const json = await res.json();
                                if (json) setChunk(json);
                        }
                    }
                } catch (e) { console.error("Failed to load on-demand world chunk", e); }
            };
            loadWorldChunk();
            return; 
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
                 if (p.x >= 0 && p.x < gridSize && p.y >= 0 && p.y < gridSize) { 
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

    const handleOpenData = () => {
         // Flatten current chunk to JSON for export
         const flattenedVoxels: {x:number, y:number, z:number, type: string}[] = [];
         if(chunk) {
            chunk.tiles.forEach((layer, z) => {
                layer?.forEach((row, y) => {
                    row?.forEach((tile, x) => {
                        if (tile && tile.block !== 'air') {
                            flattenedVoxels.push({ x, y, z, type: tile.block });
                        }
                    });
                });
            });
         }
        setDataJson(JSON.stringify(flattenedVoxels, null, 2));
        setIsDataModalOpen(true);
    };

    const handleImportData = () => {
        try {
            const parsed = JSON.parse(dataJson);
            if (Array.isArray(parsed)) {
                 const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
                 const loadedTiles = emptyLayers;

                 interface ParsedVoxel { x: number; y: number; z: number; [key: string]: unknown }
                 parsed.forEach((v: ParsedVoxel) => {
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
                const newChunk = { x: 0, y: 0, tiles: loadedTiles };
                setChunk(newChunk);
                propagateChange(newChunk);
            }
            setIsDataModalOpen(false);
        } catch {
            alert("Invalid JSON data");
        }
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
                     {/* Move Architect Button to Toolbar or keep here? Keep here for main action visibility */}
                     <Flex gap={2}>
                        <Button 
                             size="S" 
                             variant="secondary" 
                             startIcon={<Code />}
                             onClick={handleOpenData}
                             title="Import/Export Data"
                        >
                             Data
                        </Button>
                         <Button 
                            startIcon={<Magic />} 
                            variant="tertiary" 
                            size="S" 
                            onClick={() => setIsModalOpen(true)}
                         >
                            AI Architect
                         </Button>
                     </Flex>
                </Flex>
                
                <Box paddingTop={2} background="neutral100" hasRadius shadow="tableShadow" padding={4}>
                     <Flex direction="column" gap={4}>
                         
                         {/* 1. Top Toolbar */}
                         <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                            <Flex gap={2} wrap="wrap">
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
                         </Flex>

                         {/* 2. Main Canvas Area */}
                         <Box 
                            background="#212134"
                            padding={4} 
                            hasRadius 
                            shadow="filterShadow" 
                            style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', width: '100%', minHeight: '500px' }}
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
                                    imageRendering: 'pixelated',
                                    border: '1px solid #4a4a6a'
                                }} 
                            />
                        </Box>

                         {/* 3. Bottom Controls */}
                         <Box>
                             <Typography variant="sigma">Depth Control (Layer {currentZ})</Typography>
                             <Flex gap={4} paddingTop={2} alignItems="center" wrap="wrap">
                                <Flex gap={2}>
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

                                <Box style={{ flexGrow: 1, maxWidth: '300px' }}>
                                    <SingleSelect 
                                        label="Block Material"
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
                             </Flex>
                         </Box>

                     </Flex>
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
                                <SingleSelectOption value="gemini-3-flash-preview">Gemini 3 Flash Preview</SingleSelectOption>
                                <SingleSelectOption value="gemini-3-pro-preview">Gemini 3 Pro Preview</SingleSelectOption>
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

            {/* Data I/O Modal Overlay */}
            {isDataModalOpen && (
                <Box 
                    position="fixed" 
                    top={0} left={0} right={0} bottom={0} 
                    zIndex={200} 
                    background="neutral100" 
                    style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <Box background="neutral0" padding={6} hasRadius shadow="popupShadow" style={{ width: '600px', maxWidth: '90%' }}>
                        <Typography variant="beta">Data Import/Export</Typography>
                        <Box paddingTop={4} paddingBottom={4}>
                            <Typography variant="pi" textColor="neutral600" paddingBottom={2}>
                                Copy/Paste the JSON data below to share or save.
                            </Typography>
                            <Textarea 
                                style={{ height: '300px', fontFamily: 'monospace', fontSize: '12px' }}
                                value={dataJson}
                                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDataJson(e.target.value)}
                            />
                        </Box>
                        <Flex gap={2} justifyContent="flex-end">
                            <Button variant="tertiary" onClick={() => setIsDataModalOpen(false)}>Cancel</Button>
                            <Button variant="success" startIcon={<Check />} onClick={handleImportData}>
                                Import
                            </Button>
                        </Flex>
                    </Box>
                </Box>
            )}

        </>
    );
});
