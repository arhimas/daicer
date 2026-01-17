import React, { useEffect, useRef, useState } from 'react';
import { 
  Main, 
  Layouts, 
  Box, 
  Typography, 
  Button, 
  Flex,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Grid,
  GridItem
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { Chunk, WorldConfig, BlockType } from '../types';

// Constants
const Z_MIN = -3;
const Z_MAX = 3;
const TILE_SIZE = 32;

// Colors
const BLOCK_COLORS: Record<BlockType, string> = {
  air: 'transparent',
  stone: '#7d7d7d',
  dirt: '#5d4037',
  grass: '#388e3c',
  water: '#1976d2',
  sand: '#fbc02d',
  wood: '#5d4037',
  leaves: '#2e7d32',
  snow: '#ffffff',
  ice: '#90caf9',
  lava: '#d32f2f',
  bedrock: '#212121',
  gravel: '#9e9e9e',
  obsidian: '#000000',
  glass: 'rgba(255, 255, 255, 0.3)',
  planks: '#8d6e63',
  brick: '#b71c1c',
  cobblestone: '#616161',
  sandstone: '#f57f17',
  clay: '#9fa8da',
  gold_ore: '#fdd835',
  iron_ore: '#d7ccc8',
  coal_ore: '#424242',
  diamond_ore: '#00bcd4',
  torch: '#ffeb3b',
  chest: '#795548',
  crafting_table: '#d7ccc8',
  furnace: '#616161',
  door: '#795548',
  fence: '#8d6e63',
  unknown: '#ff00ff'
};

const BLOCK_TYPES = Object.keys(BLOCK_COLORS) as BlockType[];

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

  // Initial Data Fetch
  useEffect(() => {
    fetchConfig();
    fetchChunk();
  }, [chunkX, chunkY]); 

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
    setLoading(true);
    try {
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
        fetchChunk(); // Refresh chunk as config might change generation
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

    if (tileX >= 0 && tileX < 16 && tileY >= 0 && tileY < 16) {
        // Optimistic update
        // We should really update local state but simpler to re-fetch or trust backend
        
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
            fetchChunk(); // Refresh to confirm
        } catch (error) {
            console.error('Failed to update voxel', error);
        }
    }
  };

  // Rendering Loop
  useEffect(() => {
    if (!chunk || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const zIndex = currentZ + 3;

    if (!chunk.tiles || !chunk.tiles[zIndex]) {
        // Draw missing layer text
        ctx.fillStyle = '#000';
        ctx.fillText(`No Data at Z=${currentZ}`, 10, 20);
        return;
    }

    const layer = chunk.tiles[zIndex];
    const size = 16;
    
    // Resize canvas if needed
    canvasRef.current.width = size * TILE_SIZE;
    canvasRef.current.height = size * TILE_SIZE;

    // Iterate tiles
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tile = layer[y] ? layer[y][x] : null;
        let color = BLOCK_COLORS.unknown;
        
        if (tile) {
            color = BLOCK_COLORS[tile.block as BlockType] || BLOCK_COLORS.unknown;
        } else {
            color = '#000000'; // Void
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

  }, [chunk, currentZ]);

  const handleNextChunk = (dx: number, dy: number) => {
    setChunkX(prev => prev + dx);
    setChunkY(prev => prev + dy);
  };

  return (
    <Main>
      <Layouts.Header
        title="Map Explorer"
        subtitle={`Viewing Chunk (${chunkX}, ${chunkY}) at Z=${currentZ} - Seed: ${config?.seed || 'Loading...'}`}
        primaryAction={<Button onClick={() => fetchChunk()} loading={loading}>Refresh</Button>}
      />
      <Layouts.Content>
        <Box padding={8} background="neutral100">
            <Grid gap={4}>
                {/* Left Column: Controls */}
                <GridItem col={3} s={12}>
                    <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius>
                        <Typography variant="delta" tag="h2">Navigation</Typography>
                        <Box paddingTop={4}>
                            <Flex gap={2} justifyContent="center" paddingBottom={2}>
                                <Button onClick={() => handleNextChunk(0, -1)}>North</Button>
                            </Flex>
                            <Flex gap={2} justifyContent="center">
                                <Button onClick={() => handleNextChunk(-1, 0)}>West</Button>
                                <Box padding={2}><Typography>({chunkX}, {chunkY})</Typography></Box>
                                <Button onClick={() => handleNextChunk(1, 0)}>East</Button>
                            </Flex>
                            <Flex gap={2} justifyContent="center" paddingTop={2}>
                                <Button onClick={() => handleNextChunk(0, 1)}>South</Button>
                            </Flex>
                        </Box>
                        
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
                </GridItem>

                {/* Middle Column: Map */}
                <GridItem col={6} s={12}>
                    <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius style={{ display: 'flex', justifyContent: 'center' }}>
                        <canvas 
                            ref={canvasRef} 
                            onClick={handleCanvasClick}
                            style={{ cursor: 'crosshair', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                        />
                    </Box>
                </GridItem>
                
                {/* Right Column: Config */}
                <GridItem col={3} s={12}>
                    <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius>
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
                    </Box>
                </GridItem>
            </Grid>
        </Box>
      </Layouts.Content>
    </Main>
  );
};

export { HomePage };
