import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Flex, 
    Textarea,
    SingleSelect,
    SingleSelectOption
} from '@strapi/design-system';
import { Pencil, PaintBrush, Eye, Magic } from '@strapi/icons';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';


interface PixelForgeProps {
    name: string;
    value: string;
    onChange: (e: { target: { name: string; value: string; type: string } }) => void;
}

/**
 * **Pixel Forge II (SOTA Editor)**
 * 
 * A Dynamic Pixel Art Editor embedded directly into the Strapi Content Manager.
 * Supports Variable Resolutions (32x32 to 128x128) based on Entity Size.
 */
export const PixelForge = ({ name, value, onChange }: PixelForgeProps) => {
    const { post, get } = useFetchClient();
    const { form } = useContentManagerContext(); // Access sibling data (size)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modifiedData = (form as any)?.values || {};
    
    // Dynamic Sizing (Tiles -> Pixels)
    const widthTiles = modifiedData.width || 1;
    const heightTiles = modifiedData.height || 1;
    const gridWidth = widthTiles * 32;
    const gridHeight = heightTiles * 32;
    
    // Data State
    const [pixels, setPixels] = useState<string[][]>(Array(gridHeight).fill(Array(gridWidth).fill('transparent')));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [metadata, setMetadata] = useState<Record<string, any>>({});
    
    // UI State
    const [tool, setTool] = useState<'pencil' | 'eraser' | 'picker'>('pencil');
    const [color, setColor] = useState('#FF0000');
    const [isDrawing, setIsDrawing] = useState(false);
    
    // AI State
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("gemini-1.5-flash-latest");
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'queued'|'active'|'completed'|'failed'|null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
             // Determine mode based on prompt or toggle? For now, 'Sprite' is default.
             // But if we want Blueprint, we need a way to ask for it.
             // Adding Action Toggle to UI? Or just infer? 
             // Let's add a "Generate Blueprint" button or action.
             // For now, assume 'Sprite' unless specified.
             // Wait, user wants "Blueprint Generation". 
             // I'll add a 'action' parameter to handleGenerate or separate button.
             
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
                 entityData: modifiedData // Full Context Injection
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (_err) {
            setIsGenerating(false);
            setJobStatus('failed');
        }
    };

    const handleGenerateBlueprint = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setJobStatus('queued');
        try {
             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt, 
                 type: 'Sprite', // Generic
                 archetype: 'Humanoid',
                 width: gridWidth,
                 height: gridHeight,
                 model,

                 action: 'generate_blueprint',
                 entityData: modifiedData // Full Context Injection
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
                            <Flex justifyContent="space-between">
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

                        {/* Editor Body */}
                        <Box padding={6} style={{ flex: 1, overflow: 'auto' }}>
                             <Flex gap={6} alignItems="flex-start" wrap="wrap">
                                 
                                 {/* Sidebar Controls */}
                                 <Box style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                                    <Flex direction="column" gap={6}>
                                        <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                                            <Typography variant="delta" textColor="neutral800">Manifestation</Typography>
                                            <Box paddingTop={2}>
                                                <Textarea 
                                                    name="prompt"
                                                    placeholder="Describe the aesthetic..." 
                                                    value={prompt}
                                                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPrompt(e.target.value)}
                                                    style={{ height: '100px' }}
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
                                                    <SingleSelectOption value="gemini-3-pro-preview">Gemini 3.0 Pro Preview</SingleSelectOption>
                                                </SingleSelect>
                                            </Box>
                                            <Box paddingTop={4}>
                                                <Button 
                                                    onClick={handleGenerate} 
                                                    disabled={isGenerating || !prompt} 
                                                    fullWidth
                                                    startIcon={<Magic />}
                                                    loading={isGenerating}
                                                >
                                                    Forge Sprite
                                                </Button>
                                                <Box paddingTop={2}>
                                                    <Button 
                                                        onClick={handleGenerateBlueprint} 
                                                        disabled={isGenerating || !prompt} 
                                                        fullWidth
                                                        variant="secondary"
                                                        startIcon={<Magic />}
                                                        loading={isGenerating}
                                                    >
                                                        Forge Blueprint
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                                            <Typography variant="delta" textColor="neutral800">Tools</Typography>
                                            <Flex gap={2} paddingTop={2} wrap="wrap">
                                                 <Button size="S" variant={tool === 'pencil' ? 'default' : 'secondary'} onClick={() => setTool('pencil')}><Pencil /></Button>
                                                 <Button size="S" variant={tool === 'eraser' ? 'default' : 'secondary'} onClick={() => setTool('eraser')}><PaintBrush /></Button>  
                                                 <Button size="S" variant={tool === 'picker' ? 'default' : 'secondary'} onClick={() => setTool('picker')}><Eye /></Button>
                                                 <Button size="S" variant="secondary" onClick={handleAutoCenter} title="Auto-Center Content">center</Button>
                                                  <Box 
                                                    background="neutral0" 
                                                    borderColor="neutral200" 
                                                    hasRadius 
                                                    padding={1} 
                                                    style={{ border: '1px solid #dcdce4' }}
                                                 >
                                                    <input 
                                                        type="color" 
                                                        value={color} 
                                                        onChange={(e) => setColor(e.target.value)}
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
                                                    />
                                                 </Box>
                                                 <Button 
                                                    size="S" 
                                                    variant={showBlueprint ? 'default' : 'secondary'} 
                                                    onClick={() => setShowBlueprint(!showBlueprint)}
                                                    disabled={!metadata?.blueprint}
                                                    title="Toggle Blueprint Overlay"
                                                 >
                                                    BP
                                                 </Button>
                                            </Flex>
                                        </Box>
                                    </Flex>
                                 </Box>

                                 {/* Main Canvas Area */}
                                 <Box style={{ flex: '2 1 500px', display: 'flex', justifyContent: 'center' }}>
                                     <Box 
                                         background="neutral150" 
                                         padding={2}
                                         hasRadius
                                         shadow="tableShadow"
                                         style={{ 
                                             display: 'grid', 
                                             gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
                                             width: '100%',
                                             maxWidth: '600px',
                                             aspectRatio: `${gridWidth}/${gridHeight}`,
                                             border: '1px solid #333',
                                             cursor: tool === 'picker' ? 'copy' : 'crosshair'
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

                             </Flex>
                        </Box>
                    </Flex>
                </Box>
            )}
        </Box>
    );
};
