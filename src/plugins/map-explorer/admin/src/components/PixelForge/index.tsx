import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Flex, 
    Textarea,
    SingleSelect,
    SingleSelectOption,
    Grid
} from '@strapi/design-system';
import { Pencil, PaintBrush, Eye, Magic, Code, Check } from '@strapi/icons';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';


interface PixelForgeProps {
    name: string;
    value: string;
    onChange: (e: { target: { name: string; value: string; type: string } }) => void;
}

interface EntityZone {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

interface Blueprint {
    id: number;
    documentId: string;
    name: string;
    category: string;
    description?: string;
    grid: string[][];
    zones?: Record<string, unknown>;
}

interface PixelForgeMetadata {
    blueprint?: string[][];
    loadedBlueprint?: string;
    [key: string]: unknown;
}

interface StrapiContext {
    form?: {
        values?: Record<string, unknown>;
    };
    model?: string | { uid: string };
}

interface EntityData {
    id?: number | string;
    documentId?: string;
    width?: number;
    height?: number;
    name?: string;
    description?: string;
    [key: string]: unknown;
}

/**
 * **Pixel Forge II (SOTA Editor)**
 * 
 * A Dynamic Pixel Art Editor embedded directly into the Strapi Content Manager.
 * Supports Variable Resolutions (32x32 to 128x128) based on Entity Size.
 * Updated for Gemini 3 Compatibility and Data I/O.
 * 
 * @security Strict Types Enforced
 */
export const PixelForge = ({ name, value, onChange }: PixelForgeProps) => {
    const { post, get } = useFetchClient();
    const { form, model: currentModel } = useContentManagerContext() as unknown as StrapiContext; 
    
    // Strict Access
    const modifiedData = (form?.values || {}) as EntityData;
    
    // Dynamic Sizing (Tiles -> Pixels)
    const widthTiles = modifiedData.width || 1;
    const heightTiles = modifiedData.height || 1;
    // Default to 32x32 if no explicit sizing (Standard Blueprint Size)
    const gridWidth = modifiedData.width ? widthTiles * 32 : 32;
    const gridHeight = modifiedData.height ? heightTiles * 32 : 32;
    
    // Data State
    const [pixels, setPixels] = useState<string[][]>(Array(gridHeight).fill(Array(gridWidth).fill('transparent')));
    const [metadata, setMetadata] = useState<PixelForgeMetadata>({});
    
    // UI State
    const [tool, setTool] = useState<'pencil' | 'eraser' | 'picker'>('pencil');
    const [color, setColor] = useState('#FF0000');
    const [isDrawing, setIsDrawing] = useState(false);
    
    // AI State
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("gemini-3-flash-preview"); // Default to Gemini 3 Flash
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'queued'|'active'|'completed'|'failed'|null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data I/O State
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [dataJson, setDataJson] = useState("");

    // Initial Load & Resizing Logic
    useEffect(() => {
        if (value) {
            try {
                const parsed = JSON.parse(value);
                let loadedPixels: string[][] = [];

                if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
                    loadedPixels = parsed;
                } else if (parsed.pixels) {
                    loadedPixels = parsed.pixels;
                    if (parsed.prompt) setPrompt(parsed.prompt);
                    if (parsed.metadata) setMetadata(parsed.metadata);
                }

                // Resize Guard: If loaded pixels don't match grid size, pad or crop?
                if (loadedPixels.length !== gridHeight || (loadedPixels[0] && loadedPixels[0].length !== gridWidth)) {
                    console.warn(`PixelForge: Dimension mismatch. Loaded ${loadedPixels.length}x${loadedPixels[0]?.length}, Expected ${gridWidth}x${gridHeight}. Resizing...`);
                    // Create new empty grid of correct size
                    const newGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill('transparent'));
                    // Copy what fits
                    for(let y=0; y<Math.min(loadedPixels.length, gridHeight); y++) {
                        for(let x=0; x<Math.min(loadedPixels[0].length, gridWidth); x++) {
                            newGrid[y][x] = loadedPixels[y][x];
                        }
                    }
                    setPixels(newGrid);
                } else {
                    setPixels(loadedPixels);
                }

            } catch(e) {
                console.error("PixelForge: Failed to parse value", e);
            }
        } else {
            // Initialize empty grid if no value
            setPixels(Array(gridHeight).fill(Array(gridWidth).fill('transparent')));
        }
    }, [value, gridWidth, gridHeight]);

    // Polling System
    useEffect(() => {
        if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return;
        
        const poll = async () => {
            try {
                const { data } = await get(`/map-explorer/forge/status/${jobId}`);
                setJobStatus(data.state);
                
                if (data.state === 'completed' && data.result) {
                    if (data.result.pixelData) {
                         setPixels(data.result.pixelData);
                         // Store Blueprint Semantic Data if present
                         if (data.result.blueprint) {
                             const newMeta = { ...metadata, blueprint: data.result.blueprint };
                             setMetadata(newMeta);
                             propagateChange(data.result.pixelData, data.result.enhancedPrompt || prompt, newMeta);
                             setShowBlueprint(true); // Auto-show
                         } else {
                             propagateChange(data.result.pixelData, data.result.enhancedPrompt || prompt);
                         }
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

    // Auto-Context
    useEffect(() => {
        if (!prompt && modifiedData) {
            const parts = [];
            if (modifiedData.name) parts.push(modifiedData.name);
            if (modifiedData.description) parts.push(modifiedData.description);
            if (parts.length > 0) setPrompt(parts.join('. '));
        }
    }, [modifiedData, prompt]);

    const [showBlueprint, setShowBlueprint] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setJobStatus('queued');
        try {
             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt, 
                 type: 'Sprite', 
                 archetype: 'Humanoid', 
                 size: 'Custom', 
                 width: gridWidth,
                 height: gridHeight,
                 model,

                 inputPixels: pixels,
                 action: 'generate_pixel', // Default
                 entityData: modifiedData, // Fallback
                 entityContext: {
                     uid: typeof currentModel === 'string' ? currentModel : currentModel?.uid,
                     documentId: modifiedData?.documentId || modifiedData?.id // Support both
                 }
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (_err) {
            setIsGenerating(false);
            setJobStatus('failed');
        }
    };

    const propagateChange = (newPixels: string[][], newPrompt: string, newMetadata?: Record<string, unknown>) => {
        onChange({
            target: {
                name,
                value: JSON.stringify({
                    pixels: newPixels,
                    prompt: newPrompt,
                    metadata: newMetadata || metadata
                }),
                type: 'json'
            }
        });
    };

    const handlePixelClick = (x: number, y: number) => {
        // Deep copy because row arrays might be shared references if initialized via .fill(Array())
        const newPixels = pixels.map(row => [...row]);
        
        if (tool === 'picker') {
            const picked = newPixels[y][x];
            if (picked !== 'transparent') setColor(picked);
            setTool('pencil');
            return;
        }

        const paintColor = tool === 'eraser' ? 'transparent' : color;
        newPixels[y][x] = paintColor;
        setPixels(newPixels);
        propagateChange(newPixels, prompt);
    };

    const handleAutoCenter = () => {
        const matrix = pixels;
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        let minX = cols, maxX = -1, minY = rows, maxY = -1;
        
        // Scan
        for(let y=0; y<rows; y++) {
            for(let x=0; x<cols; x++) {
                if(matrix[y][x] !== 'transparent') {
                    if(x < minX) minX = x;
                    if(x > maxX) maxX = x;
                    if(y < minY) minY = y;
                    if(y > maxY) maxY = y;
                }
            }
        }
        
        if(maxX === -1) return; // Empty
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const centerX = minX + Math.floor(width/2);
        const centerY = minY + Math.floor(height/2);
        
        const targetCenterX = Math.floor(cols/2);
        const targetCenterY = Math.floor(rows/2);
        
        const deltaX = targetCenterX - centerX;
        const deltaY = targetCenterY - centerY;
        
        if(deltaX === 0 && deltaY === 0) return;
        
        const newMatrix = Array(rows).fill(null).map(() => Array(cols).fill('transparent'));
        
        for(let y=0; y<rows; y++) {
            for(let x=0; x<cols; x++) {
                if(matrix[y][x] !== 'transparent') {
                    const newX = x + deltaX;
                    const newY = y + deltaY;
                    if(newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
                        newMatrix[newY][newX] = matrix[y][x];
                    }
                }
            }
        }
        
        setPixels(newMatrix);
        propagateChange(newMatrix, prompt);
    };

    const handleOpenData = () => {
        setDataJson(JSON.stringify({
            pixels,
            prompt,
            metadata
        }, null, 2));
        setIsDataModalOpen(true);
    };

    // Blueprint State
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | number | null>(null);

    // Entity Zones State
    const [entityZones, setEntityZones] = useState<EntityZone[]>([]);

    // Fetch Blueprints & Zones
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Blueprints
                const bpRes = await get('/content-manager/collection-types/api::blueprint.blueprint?page=1&pageSize=100&sort=name:ASC');
                if (bpRes.data.results) setBlueprints(bpRes.data.results);

                // Fetch Entity Zones for Palette
                const zoneRes = await get('/content-manager/collection-types/api::entity-zone.entity-zone?page=1&pageSize=100&sort=slug:ASC');
                if (zoneRes.data.results) setEntityZones(zoneRes.data.results);

            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        if (isModalOpen) fetchData();
    }, [isModalOpen, get]);

    const handleLoadBlueprint = () => {
        const bp = blueprints.find(b => b.id === selectedBlueprintId || b.documentId === selectedBlueprintId);
        if (!bp || !bp.grid) return;

        // Visual Blueprint Load - Direct Color Mapping
        // The DB now stores actual HEX codes in the grid, so no conversion is needed.
        const newPixels = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill('transparent'));
        
        bp.grid.forEach((row: string[], y: number) => {
            if (y >= gridHeight) return;
            row.forEach((color: string, x: number) => {
                // Determine if color is valid hex or transparent
                // In new seed, it's real hex. Legacy might need fallback.
                if (x < gridWidth) {
                    newPixels[y][x] = color === '.' ? 'transparent' : color;
                }
            });
        });

        setPixels(newPixels);
        setMetadata({ ...metadata, blueprint: bp.grid, loadedBlueprint: bp.name });
        propagateChange(newPixels, prompt, { ...metadata, blueprint: bp.grid });
        setPrompt(bp.description || `A ${bp.name}...`);
    };

    const handleImportData = () => {
        try {
            const parsed = JSON.parse(dataJson);
            if(parsed.pixels) setPixels(parsed.pixels);
            if(parsed.prompt) setPrompt(parsed.prompt);
            if(parsed.metadata) setMetadata(parsed.metadata);
            
            propagateChange(
                parsed.pixels || pixels, 
                parsed.prompt || prompt, 
                parsed.metadata || metadata
            );
            setIsDataModalOpen(false);
        } catch(e) {
            console.error("Invalid JSON", e);
            alert("Invalid JSON data");
        }
    };

    return (
        <Box>
            {/* Inline Preview */}
            <Flex gap={4} alignItems="center">
                 <Box 
                    background="neutral150" 
                    borderColor="neutral200" 
                    hasRadius 
                    style={{ width: '64px', height: '64px', overflow: 'hidden', border: '1px solid #ddd' }}
                 >
                     <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
                        width: '100%',
                        height: '100%'
                     }}>
                        {pixels.map((row, y) => 
                            row.map((pixelColor, x) => (
                                <div 
                                    key={`p-${x}-${y}`}
                                    style={{ backgroundColor: pixelColor === 'transparent' ? ((x+y)%2===0 ? '#ccc' : '#fff') : pixelColor }} 
                                />
                            ))
                        )}
                     </div>
                 </Box>
                 <Button onClick={() => setIsModalOpen(true)} startIcon={<Pencil />} variant="secondary">
                     Open Pixel Forge ({gridWidth}x{gridHeight})
                 </Button>
            </Flex>

            {/* SOTA Modal Editor */}
            {isModalOpen && (
                <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={100} background="neutral100" style={{ inset: 0 }}>
                    <Flex direction="column" height="100%" alignItems="stretch">
                        
                        {/* Header */}
                        <Box background="neutral0" padding={4} shadow="filterShadow">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Flex gap={2}>
                                    <Magic />
                                    <Typography variant="beta">Pixel Forge</Typography>
                                    <Typography variant="pi" textColor="neutral600">
                                        {widthTiles}x{heightTiles} Tiles ({gridWidth}x{gridHeight}px)
                                    </Typography>
                                </Flex>
                                <Button onClick={() => setIsModalOpen(false)} variant="tertiary">Close</Button>
                            </Flex>
                        </Box>

                        {/* Top Toolbar (Tools & Color) */}
                        <Box background="neutral0" padding={2} shadow="tableShadow" zIndex={2}>
                            <Flex gap={2} justifyContent="center" wrap="wrap">
                                 <Button size="S" variant={tool === 'pencil' ? 'default' : 'secondary'} onClick={() => setTool('pencil')}><Pencil /></Button>
                                 <Button size="S" variant={tool === 'eraser' ? 'default' : 'secondary'} onClick={() => setTool('eraser')}><PaintBrush /></Button>  
                                 <Button size="S" variant={tool === 'picker' ? 'default' : 'secondary'} onClick={() => setTool('picker')}><Eye /></Button>
                                 <Button size="S" variant="secondary" onClick={handleAutoCenter} title="Auto-Center Content">center</Button>
                                 
                                 <Box width="1px" background="neutral200" height="24px" margin={2} />

                                  <Box 
                                    background="neutral0" 
                                    borderColor="neutral200" 
                                    hasRadius 
                                    padding={1} 
                                    style={{ border: '1px solid #dcdce4', display: 'flex', alignItems: 'center' }}
                                 >
                                    <input 
                                        type="color" 
                                        value={color} 
                                        onChange={(e) => { setColor(e.target.value); setTool('pencil'); }}
                                        style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
                                    />
                                 </Box>

                                 {/* Zone Palette */}
                                 {entityZones.length > 0 && (
                                     <Flex gap={1} wrap="wrap" style={{ maxWidth: '200px', marginLeft: '8px' }}>
                                         {entityZones.map((z: EntityZone) => (
                                             <button
                                                 key={z.slug}
                                                 title={`${z.name} (${z.slug})`}
                                                 onClick={() => { setColor(z.color); setTool('pencil'); }}
                                                 style={{
                                                     width: '16px', height: '16px',
                                                     backgroundColor: z.color,
                                                     border: color === z.color ? '2px solid #000' : '1px solid #ccc',
                                                     borderRadius: '2px',
                                                     cursor: 'pointer'
                                                 }}
                                             />
                                         ))}
                                     </Flex>
                                 )}
                                 
                                 <Button 
                                    size="S" 
                                    variant={showBlueprint ? 'default' : 'secondary'} 
                                    onClick={() => setShowBlueprint(!showBlueprint)}
                                    disabled={!metadata?.blueprint}
                                    title="Toggle Blueprint Overlay"
                                >
                                    BP
                                </Button>

                                <Box width="1px" background="neutral200" height="24px" margin={2} />

                                <Button 
                                    size="S" 
                                    variant="secondary" 
                                    startIcon={<Code />}
                                    onClick={handleOpenData}
                                    title="Import/Export Data"
                                >
                                    Data
                                </Button>
                            </Flex>
                        </Box>

                        {/* Main Canvas Area (Scrollable, Centered, Dark BG) */}
                        <Box 
                            style={{ 
                                flex: 1, 
                                overflow: 'auto', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#212134' // Dark background for contrast
                            }}
                        >
                             <Box 
                                 background="neutral150" 
                                 padding={0} // No padding, exact fit
                                 shadow="tableShadow"
                                 style={{ 
                                     display: 'grid', 
                                     gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
                                     width: '90%', // Responsive width
                                     maxWidth: '600px',
                                     aspectRatio: `${gridWidth}/${gridHeight}`,
                                     border: '1px solid #4a4a6a',
                                     cursor: tool === 'picker' ? 'copy' : 'crosshair',
                                     imageRendering: 'pixelated'
                                 }}
                                 onMouseLeave={() => setIsDrawing(false)}
                                 onMouseUp={() => setIsDrawing(false)}
                             >
                                 {pixels.map((row, y) => 
                                     row.map((pixelColor, x) => (
                                         <div 
                                             key={`${x}-${y}`}
                                             style={{ 
                                                 backgroundColor: pixelColor === 'transparent' ? ( (x+y)%2===0 ? '#222' : '#2a2a2a') : pixelColor, 
                                                 width: '100%', 
                                                 height: '100%',
                                                 position: 'relative',
                                                 display: 'flex',
                                                 alignItems: 'center',
                                                 justifyContent: 'center',
                                                 fontSize: '8px',
                                                 color: 'rgba(255,255,255,0.7)',
                                                 userSelect: 'none'
                                             }}
                                             onMouseDown={() => { setIsDrawing(true); handlePixelClick(x, y); }}
                                             onMouseEnter={() => { if (isDrawing) handlePixelClick(x, y); }}
                                         >
                                             {showBlueprint && metadata?.blueprint?.[y]?.[x] && metadata.blueprint[y][x] !== '.' && (
                                                 <span>{metadata.blueprint[y][x]}</span>
                                             )}
                                         </div>
                                     ))
                                 )}
                             </Box>
                        </Box>

                        {/* Bottom Manifestation Control */}
                        <Box background="neutral0" padding={4} shadow="filterShadow" style={{ borderTop: '1px solid #eaeaef' }}>
                            <Grid.Root gap={4}>
                                <Grid.Item col={8} s={12}>
                                    <Textarea 
                                        name="prompt"
                                        placeholder="Describe the aesthetic to manifest..." 
                                        value={prompt}
                                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPrompt(e.target.value)}
                                        style={{ height: '80px', resize: 'none' }}
                                    />
                                </Grid.Item>
                                <Grid.Item col={12} s={12}>
                                    <Flex gap={2} alignItems="center">
                                         <SingleSelect 
                                            placeholder="Load Blueprint..."
                                            size="S"
                                            value={selectedBlueprintId} 
                                            onChange={setSelectedBlueprintId}
                                        >
                                            {blueprints.map((b: Blueprint) => (
                                                <SingleSelectOption key={b.documentId || b.id} value={b.documentId || b.id}>
                                                    {b.name} ({b.category})
                                                </SingleSelectOption>
                                            ))}
                                        </SingleSelect>
                                        <Button 
                                            size="S" 
                                            variant="secondary" 
                                            onClick={handleLoadBlueprint}
                                            disabled={!selectedBlueprintId}
                                        >
                                            Load
                                        </Button>
                                    </Flex>
                                </Grid.Item>
                                <Grid.Item col={4} s={12}>
                                    <Flex direction="column" gap={2} height="100%" justifyContent="center">
                                         <SingleSelect 
                                            placeholder="Model"
                                            size="S"
                                            value={model} 
                                            onChange={setModel}
                                        >
                                            <SingleSelectOption value="gemini-3-flash-preview">Gemini 3 Flash Preview</SingleSelectOption>
                                            <SingleSelectOption value="gemini-3-pro-preview">Gemini 3 Pro Preview</SingleSelectOption>
                                        </SingleSelect>
                                        
                                        <Flex gap={2}>
                                            <Button 
                                                onClick={handleGenerate} 
                                                disabled={isGenerating || !prompt} 
                                                fullWidth
                                                startIcon={<Magic />}
                                                loading={isGenerating}
                                                size="S"
                                            >
                                                Generate
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Grid.Item>
                            </Grid.Root>
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
            )}
        </Box>
    );
};
