import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Flex,
  // Grid,
  SingleSelect,
  SingleSelectOption,
  Textarea
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { useIntl } from 'react-intl';
import { Trash, Drag, Pencil, Magic, Code, Check } from '@strapi/icons';
import { Chunk } from '../../types';

// Constants for Texture Mode
const GRID_SIZE = 32;
const MAX_Z = 0;

interface TextureInputProps {
  name: string;
  value?: string | null;
  onChange: (e: { target: { name: string; value: unknown; type: string } }) => void;
  attribute: { type: string; customField: string; options?: { size?: number } };
  intlLabel: { id: string; defaultMessage?: string };
}

export const TextureInput = React.forwardRef<HTMLInputElement, TextureInputProps>((props, _ref) => {
    const { name, value, onChange, attribute, intlLabel } = props;
    const { formatMessage } = useIntl();
    const { post, get } = useFetchClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Access Parent Entity Context (Mocked/Empty safely)
    const modifiedData: Record<string, unknown> = {}; 

    // State
    const [chunk, setChunk] = useState<Chunk | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>('#000000');
    const [opacity, setOpacity] = useState<number>(1);
    // const [showDebug, setShowDebug] = useState(false); // Replaced by Data Modal
    
    // AI State
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'queued'|'active'|'completed'|'failed'|null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [model, setModel] = useState("gemini-3-pro-preview"); // Default to Gemini 3 Pro

    // Viewport
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'brush' | 'pan' | 'rect' | 'circle'>('brush');
    
    // Shape Drag State (Placeholder if needed later, kept for compatibility)
    // Shape Drag State removed


     // Data I/O State
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [dataJson, setDataJson] = useState("");

    // Helpers
    const getRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getActiveColor = () => getRgba(selectedColor, opacity);

    // Polling System for AI Integration
    useEffect(() => {
        if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return;
        
        const poll = async () => {
            try {
                const { data } = await get(`/map-explorer/forge/status/${jobId}`);
                setJobStatus(data.state);
                
                if (data.state === 'completed' && data.result) {
                    if (data.result.pixelData) {
                         // Convert 2D string array to Chunk format
                         const newTiles = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
                         
                         // Fill Layer 0
                         data.result.pixelData.forEach((row: string[], y: number) => {
                             if (!newTiles[0][y]) newTiles[0][y] = Array(GRID_SIZE).fill(null);
                             row.forEach((color: string, x: number) => {
                                 if (x < GRID_SIZE && y < GRID_SIZE) {
                                     newTiles[0][y][x] = {
                                         x, y, z: 0,
                                         block: color,
                                         biome: 'custom',
                                         isWalkable: true,
                                         isTransparent: false,
                                         variant: 0
                                     };
                                 }
                             });
                         });
                         
                         const newChunk = { x: 0, y: 0, tiles: newTiles };
                         setChunk(newChunk);
                         propagateChange(newChunk);
                    }
                    setIsGenerating(false);
                    setJobId(null);
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
    }, [jobId, jobStatus]); 

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
        
        let loadedTiles = defaultLayers;
        let requiresAutoFill = true;

        if (value) {
            try {
                const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                    
                    const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
                    loadedTiles = emptyLayers;
                    requiresAutoFill = false;

                    parsedValue.forEach((v: { x: number; y: number; z: number; type?: string; block?: string }) => {
                         if (v.z === 0 && v.y >= 0 && v.y < GRID_SIZE && v.x >= 0 && v.x < GRID_SIZE) {
                             if (!loadedTiles[0]) loadedTiles[0] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
                             if (!loadedTiles[0][v.y]) loadedTiles[0][v.y] = Array(GRID_SIZE).fill(null);
                             
                             loadedTiles[0][v.y][v.x] = {
                                 x: v.x, y: v.y, z: 0,
                                 block: v.type || v.block || '#888888', 
                                 biome: 'custom',
                                 isWalkable: true,
                                 isTransparent: false,
                                 variant: 0
                             };
                         }
                    });
                }
            } catch {
                console.error("Failed to parse texture data");
            }
        }
        
        setChunk({ x: 0, y: 0, tiles: loadedTiles });

        // AUTO-FILL PROPAGATION for empty/new fields
        if (requiresAutoFill && !value) {
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
            setTimeout(() => {
                onChange({ target: { name, value: JSON.stringify(flattenedVoxels), type: attribute.type } });
            }, 100);
        }

    }, [value]);

    // Render Canvas
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
        
        const CELL_SIZE = 512 / GRID_SIZE; // 16px

        // Draw Pixels
        chunk.tiles[0].forEach((row, y) => {
            if (!row) return;
            row.forEach((tile, x) => {
                if (!tile) return;
                
                let color = tile.block;
                // Simple Fallback
                if (!color || color === 'air') return; 
                
                if (!color.startsWith('#') && !color.startsWith('rgb')) {
                     if (color === 'stone') color = '#7d7d7d';
                     else if (color === 'dirt') color = '#5d4037';
                     else if (color === 'grass') color = '#4caf50';
                     else color = '#888888'; 
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
            
            const color = tool === 'brush' ? getActiveColor() : 'transparent'; 

            newChunk.tiles[0][tile.y][tile.x] = {
                x: tile.x, y: tile.y, z: 0,
                block: color,
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
         const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
         const newChunk = { x: 0, y: 0, tiles: emptyLayers };
         setChunk(newChunk);
         propagateChange(newChunk);
    };

    const handleGenerate = async () => {
        const size = (modifiedData?.size as string) || 'Medium'; 
        const entityName = (modifiedData?.name as string) || '';
        const prompt = entityName || intlLabel?.defaultMessage || name; 

        setIsGenerating(true);
        setJobStatus('queued');

        try {
             let inputPixels: string[][] | undefined = undefined;
             if (chunk && chunk.tiles && chunk.tiles[0]) {
                 inputPixels = chunk.tiles[0].map(row => row.map(cell => cell ? cell.block : 'transparent'));
             }

             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt: `${prompt} texture, ${size} size`,
                 type: 'Terrain', 
                 archetype: 'Environment', 
                 size,
                 model, 
                 inputPixels, 
                 entityData: modifiedData 
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (e) {
            console.error("Failed to dispatch generation", e);
            setIsGenerating(false);
            setJobStatus('failed');
        }
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
            // Re-use parsing logic (simplified)
            if (Array.isArray(parsed)) {
                 const emptyLayers = Array(MAX_Z + 1).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
                 const loadedTiles = emptyLayers;

                 parsed.forEach((v: Record<string, unknown>) => {
                     if (v.z === 0 && v.y >= 0 && v.y < GRID_SIZE && v.x >= 0 && v.x < GRID_SIZE) {
                         if (!loadedTiles[0]) loadedTiles[0] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
                         if (!loadedTiles[0][v.y]) loadedTiles[0][v.y] = Array(GRID_SIZE).fill(null);
                         
                         loadedTiles[0][v.y][v.x] = {
                             x: v.x, y: v.y, z: 0,
                             block: v.type || v.block || '#888888', 
                             biome: 'custom',
                             isWalkable: true,
                             isTransparent: false,
                             variant: 0
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
            
            <Box paddingTop={2} background="neutral100" hasRadius shadow="tableShadow" padding={4}>
                 <Flex direction="column" gap={4}>
                     
                     {/* 1. Top Toolbar */}
                     <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                        <Flex gap={2}>
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
                                variant="danger-light" 
                                onClick={handleClear} 
                                startIcon={<Trash />}
                                size="S"
                            >
                                Clear
                            </Button>
                        </Flex>
                        <Flex gap={2} alignItems="center">
                             <SingleSelect 
                                placeholder="Model"
                                size="S"
                                value={model} 
                                onChange={setModel}
                                style={{ width: '150px' }}
                            >
                                <SingleSelectOption value="gemini-3-flash-preview">Gemini 3 Flash Preview</SingleSelectOption>
                                <SingleSelectOption value="gemini-3-pro-preview">Gemini 3 Pro Preview</SingleSelectOption>
                            </SingleSelect>
                            <Button 
                                variant="tertiary" 
                                onClick={handleGenerate} 
                                startIcon={<Magic />}
                                size="S"
                                loading={isGenerating}
                                disabled={isGenerating}
                            >
                                Generate
                            </Button>
                        </Flex>
                     </Flex>

                     {/* 2. Main Canvas (Centered, Dark) */}
                     <Box 
                        background="#212134" 
                        padding={4} 
                        hasRadius 
                        shadow="filterShadow" 
                        style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', width: '100%', minHeight: '300px' }}
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
                                maxWidth: '400px', // Limit max width for readability
                                height: 'auto',
                                aspectRatio: '1',
                                cursor: tool === 'pan' ? 'grab' : 'crosshair', 
                                imageRendering: 'pixelated',
                                display: 'block',
                                border: '1px solid #4a4a6a'
                            }} 
                        />
                    </Box>

                     {/* 3. Bottom Controls (Palette & Settings) */}
                     <Box>
                         <Typography variant="sigma">Color Palette</Typography>
                         <Flex gap={2} paddingTop={2} wrap="wrap" justifyContent="center">
                            {PALETTE.map(c => (
                                <Box 
                                    key={c}
                                    background={c}
                                    width="32px" 
                                    height="32px" 
                                    hasRadius 
                                    cursor="pointer"
                                    borderColor={selectedColor === c ? 'primary600' : 'neutral200'}
                                    borderWidth={selectedColor === c ? '3px' : '1px'}
                                    borderStyle="solid"
                                    onClick={() => setSelectedColor(c)}
                                />
                            ))}
                         </Flex>
                         
                         <Flex gap={4} paddingTop={4} alignItems="center" wrap="wrap">
                             <Flex gap={2} alignItems="center">
                                <Box 
                                    width="32px" 
                                    height="32px" 
                                    background={getActiveColor()} 
                                    hasRadius 
                                    borderColor="neutral200"
                                    borderWidth="1px"
                                    borderStyle="solid"
                                />
                                <input 
                                    type="color" 
                                    value={selectedColor} 
                                    onChange={e => setSelectedColor(e.target.value)} 
                                    style={{width: '60px', height: '32px', border: 'none', background: 'none'}} 
                                />
                             </Flex>
                             
                             <Box style={{ flex: 1 }}>
                                <Flex justifyContent="space-between">
                                    <Typography variant="pi">Opacity: {Math.round(opacity * 100)}%</Typography>
                                </Flex>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1" 
                                    value={opacity} 
                                    onChange={e => setOpacity(parseFloat(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                             </Box>

                             <Button 
                                variant="tertiary" 
                                onClick={handleOpenData} 
                                startIcon={<Code />}
                                size="S"
                            >
                                Data
                            </Button>
                         </Flex>
                     </Box>

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

                 </Flex>
            </Box>
        </Box>
    );
});
