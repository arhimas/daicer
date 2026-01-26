import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Flex, 
    Textarea
} from '@strapi/design-system';
import { Pencil, PaintBrush, Eye, Magic } from '@strapi/icons';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/content-manager/strapi-admin';
import { getPixelDimensions } from '../../utils/entity-geometry';

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
    const entitySize = modifiedData.size || 'medium'; // Default to medium if undefined
    const gridSize = getPixelDimensions(entitySize); // Dynamic Resolution (32, 64, 128...)
    
    // Data State
    const [pixels, setPixels] = useState<string[][]>(Array(gridSize).fill(Array(gridSize).fill('transparent')));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [metadata, setMetadata] = useState<any>({});
    
    // UI State
    const [tool, setTool] = useState<'pencil' | 'eraser' | 'picker'>('pencil');
    const [color, setColor] = useState('#FF0000');
    const [isDrawing, setIsDrawing] = useState(false);
    
    // AI State
    const [prompt, setPrompt] = useState("");
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
                // For now, if sizes mismatch, we trust the DB data but warn, 
                // OR we can implement migration logic here. 
                // Simplest SOTA: Just use loaded data, but UI grid might look weird if mismatch.
                // Let's force reset if dimensions are fundamentally different to avoid crash.
                if (loadedPixels.length !== gridSize) {
                    console.warn(`PixelForge: Dimension mismatch. Loaded ${loadedPixels.length}, Expected ${gridSize}. Resizing...`);
                    // Create new empty grid of correct size
                    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('transparent'));
                    // Copy what fits
                    for(let y=0; y<Math.min(loadedPixels.length, gridSize); y++) {
                        for(let x=0; x<Math.min(loadedPixels[0].length, gridSize); x++) {
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
            setPixels(Array(gridSize).fill(Array(gridSize).fill('transparent')));
        }
    }, [value, gridSize]); // Re-run when entitySize changes (gridSize)

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
                         propagateChange(data.result.pixelData, data.result.enhancedPrompt || prompt);
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

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setJobStatus('queued');
        try {
             const { data } = await post('/map-explorer/forge/dispatch', {
                 prompt, 
                 type: 'Sprite', 
                 archetype: 'Humanoid', 
                 size: entitySize, // Pass Dynamic Size to Backend
                 model: 'gemini-1.5-flash-latest'
             });
             
             if (data.jobId) setJobId(data.jobId);
        } catch (_err) {
            setIsGenerating(false);
            setJobStatus('failed');
        }
    };

    const propagateChange = (newPixels: string[][], newPrompt: string) => {
        onChange({
            target: {
                name,
                value: JSON.stringify({
                    pixels: newPixels,
                    prompt: newPrompt,
                    metadata
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
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
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
                     Open Pixel Forge ({gridSize}x{gridSize})
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
                                        {entitySize.toUpperCase()} ({gridSize}px)
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
                                                <Button 
                                                    onClick={handleGenerate} 
                                                    disabled={isGenerating || !prompt} 
                                                    fullWidth
                                                    startIcon={<Magic />}
                                                    loading={isGenerating}
                                                >
                                                    Forge Sprite
                                                </Button>
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
                                             gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                                             width: '100%',
                                             maxWidth: '600px',
                                             aspectRatio: '1/1',
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
                                                         height: '100%'
                                                     }}
                                                     onMouseDown={() => { setIsDrawing(true); handlePixelClick(x, y); }}
                                                     onMouseEnter={() => { if (isDrawing) handlePixelClick(x, y); }}
                                                 />
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
