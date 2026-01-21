import React, { useEffect, useRef, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { 
  Main, 
  Box, 
  Typography, 
  Button, 
  Flex,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Grid,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  HeaderLayout,
  ContentLayout
} from '@strapi/design-system';
import { House, Earth, Check, Cross } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { PLUGIN_ID } from '../pluginId';
import { Chunk, WorldConfig, BlockType, Construction } from '../types';

import { Z_MIN, Z_MAX, TILE_SIZE, BLOCK_COLORS, BLOCK_TYPES } from '../constants';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get, post, put } = useFetchClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [config, setConfig] = useState<WorldConfig | null>(null);
  const [chunk, setChunk] = useState<Chunk | null>(null);
  const [chunkX, setChunkX] = useState(0);
  const [chunkY, setChunkY] = useState(0);
  const [currentZ, setCurrentZ] = useState(0); // View Z-Level
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('stone');
  const [configForm, setConfigForm] = useState<Partial<WorldConfig>>({});
  
  // Builder Mode State
  const [mode, setMode] = useState<'explorer' | 'builder'>('explorer');
  const [constructionName, setConstructionName] = useState('');
  const [constructionCategory, setConstructionCategory] = useState<Construction['category']>('misc');
  const [library, setLibrary] = useState<Construction[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    fetchConfig();
    fetchChunk();
    fetchLibrary();
  }, [chunkX, chunkY]); 
  
  // When switching modes, reset data if needed
  useEffect(() => {
      if (mode === 'builder') {
          // Initialize empty chunk for builder
          const emptyLayers = Array(16).fill(null).map(() => Array(16).fill(null).map(() => Array(16).fill(null)));
          setChunk({ x: 0, y: 0, tiles: emptyLayers });
      } else {
          fetchChunk();
      }
  }, [mode]);

  const fetchLibrary = async () => {
      try {
          const res = await get(`/${PLUGIN_ID}/constructions`);
          if (res.data) setLibrary(res.data);
      } catch (e) {
          console.error('Failed to fetch library', e);
      }
  };
  
  const loadConstruction = (c: Construction) => {
      // Convert flat voxel list back to 3D array
      const layers = Array(16).fill(null).map(() => Array(16).fill(null).map(() => Array(16).fill(null)));
      
      if (c.voxels && Array.isArray(c.voxels)) {
          c.voxels.forEach(v => {
              if (v.z >= 0 && v.z < 16 && v.y >= 0 && v.y < 16 && v.x >= 0 && v.x < 16) {
                 if (!layers[v.z]) layers[v.z] = Array(16).fill(null).map(() => Array(16).fill(null));
                 if (!layers[v.z][v.y]) layers[v.z][v.y] = Array(16).fill(null);
                 
                 layers[v.z][v.y][v.x] = {
                     x: v.x, y: v.y, z: v.z,
                     block: v.type,
                     biome: 'construction',
                     isWalkable: true,
                     isTransparent: false,
                     variant: 0
                 };
              }
          });
      }
      
      setChunk({ x: 0, y: 0, tiles: layers });
      setConstructionName(c.name);
      setConstructionCategory(c.category as any);
  };

  // ... (fetchConfig, fetchChunk unchanged)
  
  const fetchConfig = async () => {
    try {
      const res = await get(`/${PLUGIN_ID}/config`);
      setConfig(res.data);
      setConfigForm(res.data);
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  const fetchChunk = async () => {
    if (mode === 'builder') return; // Don't fetch world chunk in builder mode

    setLoading(true);
    try {
      // In Explorer, we fetch the world chunk
      const res = await get(`/${PLUGIN_ID}/chunk?x=${chunkX}&y=${chunkY}`);
      setChunk(res.data);
    } catch (error) {
      console.error('Failed to fetch chunk', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
        await put(`/${PLUGIN_ID}/config`, configForm);
        fetchConfig();
        if (mode === 'explorer') fetchChunk(); 
    } catch (error) {
        console.error('Failed to update config', error);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !chunk) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    // Ensure Z is within bounds (0-15 for array indexing typically, or relative to sea level)
    // Our chunk.tiles is array[16][16][16] usually? 
    // Backend Voxel Engine usually handles infinite Z. 
    // Frontend Chunk type is Tile[][][].
    // Let's assume frontend logic works with relative Z for now or 0-indexed layers.
    // NOTE: currentZ can be -3..3 
    // We Map -3..3 to 0..6 for rendering index in line 154: `const zIndex = currentZ + 3;`
    // So we must use that index for local updates.
    
    const zIndex = currentZ + 3;

    if (tileX >= 0 && tileX < 16 && tileY >= 0 && tileY < 16) {
        
        if (mode === 'builder') {
             // Local Edit
             const newChunk = { ...chunk };
             if (!newChunk.tiles) newChunk.tiles = [];
             if (!newChunk.tiles[zIndex]) newChunk.tiles[zIndex] = [];
             
             // Ensure row exists
             if (!newChunk.tiles[zIndex][tileY]) newChunk.tiles[zIndex][tileY] = Array(16).fill(null);
             
             newChunk.tiles[zIndex][tileY][tileX] = {
                 x: tileX, y: tileY, z: currentZ,
                 block: selectedBlock,
                 biome: 'custom',
                 isWalkable: true, 
                 isTransparent: false,
                 variant: 0
             };
             setChunk(newChunk);
             
        } else {
            // Explorer Edit (Persistent)
            try {
                await post(`/${PLUGIN_ID}/voxel`, {
                    chunkX,
                    chunkY,
                    voxelX: tileX,
                    voxelY: tileY,
                    voxelZ: currentZ,
                    newType: selectedBlock,
                    reason: 'Admin Map Explorer'
                });
                fetchChunk(); 
            } catch (error) {
                console.error('Failed to update voxel', error);
            }
        }
    }
  };
  
  // ... render loop unchanged ...

  // ... handleNextChunk unchanged ...

  const saveConstruction = async () => {
      if (!constructionName || !chunk) return;
      
      // Flatten chunk to Voxel List
      const voxels: {x:number, y:number, z:number, type: BlockType}[] = [];
      
      // Iterate all layers in chunk.tiles
      // Note: chunk.tiles might be sparse or array based.
      chunk.tiles.forEach((layer, zIdx) => {
          if (!layer) return;
          layer.forEach((row, y) => {
             if (!row) return;
             row.forEach((tile, x) => {
                 if (tile && tile.block !== 'air') {
                     // We map back from array index 0..16 to logical Z if needed?
                     // line 154: zIndex = currentZ + 3. 
                     // So Logical Z = zIndex - 3?
                     // Or do we just save as 0..16 relative to construction base?
                     // Let's save as Relative 0..16 for Construction.
                     voxels.push({
                         x, 
                         y, 
                         z: zIdx, // Save array index as absolute Z for construction
                         type: tile.block
                     });
                 } 
             });
          });
      });

      try {
          await post(`/${PLUGIN_ID}/constructions`, {
              name: constructionName,
              category: constructionCategory,
              width: 16, height: 16, depth: 16,
              voxels: voxels
          });
          alert('Construction saved!');
          fetchLibrary();
      } catch(e) {
          console.error(e);
          alert('Failed to save');
      }
  };

  return (
    <Main>
      <HeaderLayout
        title={mode === 'builder' ? "Structure Builder" : "Map Explorer"}
        primaryAction={
             mode === 'builder' ? (
                <Button startIcon={<Earth />} onClick={() => setMode('explorer')} variant="tertiary">
                    Back to Explorer
                </Button>
             ) : (
                <Button startIcon={<House />} onClick={() => setMode('builder')}>
                    Structure Builder
                </Button>
             )
        }
        subtitle={mode === 'builder' ? "Create and save new structures" : `Exploring Chunk [${chunkX}, ${chunkY}]`}
      />
      <ContentLayout>
         <Box padding={8} background="neutral100">
             {/* ... (Existing Grid Content) ... */}
            <Grid.Root gap={4}>
                 <Grid.Item col={3} s={12}>
                      <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius>
                        <Typography variant="delta" tag="h2">{mode === 'builder' ? "Builder Tools" : "Navigation"}</Typography>
                         
                         {/* Navigation Controls */}
                         {mode === 'explorer' && (
                             <Box paddingTop={4}>
                                 <Flex gap={2}>
                                     <Box>
                                        <Typography variant="pi" fontWeight="bold">X: </Typography>
                                        <NumberInput value={chunkX} onValueChange={setChunkX} />
                                     </Box>
                                     <Box>
                                        <Typography variant="pi" fontWeight="bold">Y: </Typography>
                                        <NumberInput value={chunkY} onValueChange={setChunkY} />
                                     </Box>
                                 </Flex>
                             </Box>
                         )}

                         <Box paddingTop={6}>
                            <Typography variant="sigma" tag="h3">Z-Level ({currentZ})</Typography>
                             <Flex gap={2} paddingTop={2}>
                             <Button 
                                 disabled={currentZ <= Z_MIN} 
                                 onClick={() => setCurrentZ(z => Math.max(Z_MIN, z - 1))}
                             >
                                 Down
                             </Button>
                             <Button 
                                 disabled={currentZ >= Z_MAX} 
                                 onClick={() => setCurrentZ(z => Math.min(Z_MAX, z + 1))}
                             >
                                 Up
                             </Button>
                         </Flex>
                         </Box>
                         
                         <Box paddingTop={6}>
                            <Typography variant="sigma" tag="h3">Brush</Typography>
                            <SingleSelect 
                                label="Block Type" 
                                value={selectedBlock} 
                                onChange={setSelectedBlock}
                            >
                                {BLOCK_TYPES.map(type => (
                                    <SingleSelectOption key={type} value={type}>{type}</SingleSelectOption>
                                ))}
                            </SingleSelect>
                        </Box>

                     </Box>
                 </Grid.Item>

                 <Grid.Item col={6} s={12}>
                     <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius style={{ display: 'flex', justifyContent: 'center' }}>
                         <canvas 
                             ref={canvasRef} 
                             onClick={handleCanvasClick}
                             style={{ cursor: 'crosshair', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                         />
                     </Box>
                 </Grid.Item>
                 
                <Grid.Item col={3} s={12}>
                    <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius>
                        {mode === 'builder' ? (
                            <>
                                <Typography variant="delta" tag="h2">Save Construction</Typography>
                                <Box paddingTop={4}>
                                    <TextInput 
                                        label="Name" 
                                        name="c_name" 
                                        value={constructionName} 
                                        onChange={(e: any) => setConstructionName(e.target.value)}
                                    />
                                </Box>
                                <Box paddingTop={2}>
                                    <SingleSelect 
                                        label="Category" 
                                        value={constructionCategory} 
                                        onChange={setConstructionCategory}
                                    >
                                        {['village', 'castle', 'tower', 'dungeon', 'house', 'shop', 'temple', 'misc'].map(c => (
                                           <SingleSelectOption key={c} value={c}>{c}</SingleSelectOption> 
                                        ))}
                                    </SingleSelect>
                                </Box>
                                <Box paddingTop={4}>
                                    <Button fullWidth onClick={saveConstruction} startIcon={<Check />}>Save Structure</Button>
                                </Box>
                                
                                <Box paddingTop={8} paddingBottom={2}>
                                    <Typography variant="delta" tag="h3">Library</Typography>
                                </Box>
                                <Box background="neutral100" padding={2} hasRadius style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {library.length === 0 && <Typography variant="pi" textColor="neutral600">No structures saved.</Typography>}
                                    {library.map(c => (
                                        <Box key={c.documentId} padding={2} marginBottom={2} background="neutral0" shadow="filterShadow" hasRadius cursor="pointer" onClick={() => loadConstruction(c)}>
                                            <Flex justifyContent="space-between">
                                                <Typography fontWeight="bold">{c.name}</Typography>
                                                <Typography variant="pi">{c.category}</Typography>
                                            </Flex>
                                            <Box paddingTop={1}>
                                                <Typography variant="pi" textColor="neutral600">{c.voxels?.length || 0} voxels</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography variant="delta" tag="h2">World Config</Typography>
                                <Box paddingTop={4}>
                                    <TextInput 
                                        label="Seed" 
                                        name="seed" 
                                        value={configForm.seed || ''} 
                                        onChange={(e: any) => setConfigForm(s => ({...s, seed: e.target.value}))}
                                    />
                                </Box>
                                <Box paddingTop={2}>
                                    <NumberInput 
                                        label="Chunk Size" 
                                        name="chunkSize" 
                                        value={configForm.chunkSize || 16} 
                                        onValueChange={(val: number) => setConfigForm(s => ({...s, chunkSize: val}))}
                                    />
                                </Box>
                                <Box paddingTop={2}>
                                    <NumberInput 
                                        label="Sea Level" 
                                        name="seaLevel" 
                                        value={configForm.seaLevel || 0}
                                        step={0.1} 
                                        onValueChange={(val: number) => setConfigForm(s => ({...s, seaLevel: val}))}
                                    />
                                </Box>
                                <Box paddingTop={4}>
                                    <Button fullWidth onClick={handleUpdateConfig}>Save Config</Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Grid.Item>
            </Grid.Root>
         </Box>
      </ContentLayout>
    </Main>
  );
};

export { HomePage };
