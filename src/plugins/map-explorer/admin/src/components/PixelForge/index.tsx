import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Flex,
  Textarea,
  SingleSelect,
  SingleSelectOption,
  Grid,
} from '@strapi/design-system';
import { Pencil, PaintBrush, Eye, Magic, Code, Check, Pin } from '@strapi/icons';
import { useFetchClient, useForm } from '@strapi/admin/strapi-admin';
import { useParams } from 'react-router-dom';

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
  symbol: string;
  color: string;
  description?: string;
  category?: string;
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

interface Socket {
  x: number;
  y: number;
  label?: string;
}

interface PixelForgeMetadata {
  blueprint?: string[][];
  loadedBlueprint?: string;
  sockets?: Socket[];
  [key: string]: unknown;
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
  const params = useParams<{ slug?: string; id?: string }>();
  const formValues = useForm('PixelForge', (state) => state.values);

  // Resolve Model UID safe
  const modelUid = params.slug;

  // Strict Access
  const modifiedData = (formValues || {}) as EntityData;

  // SOTA D&D Sizing Mapping
  // Default to 1 (32x32) if anything goes wrong
  let widthTiles = 1;
  let heightTiles = 1;

  if (modifiedData.size) {
    const s = String(modifiedData.size).toLowerCase();
    if (s === 'large') widthTiles = 2;
    else if (s === 'huge') widthTiles = 3;
    else if (s === 'gargantuan' || s === 'colossal') widthTiles = 4;
  } else if (modifiedData.width) {
     widthTiles = Number(modifiedData.width);
  }

  heightTiles = widthTiles; // Always square

  const gridWidth = widthTiles * 32;
  const gridHeight = heightTiles * 32;

  // Data State
  const [pixels, setPixels] = useState<string[][]>(
    Array(gridHeight).fill(Array(gridWidth).fill('transparent'))
  );
  const [metadata, setMetadata] = useState<PixelForgeMetadata>({});

  // UI State
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'picker' | 'pin'>('pencil');
  const [color, setColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);

  // AI State
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview'); // Default to Gemini 3 Flash
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'queued' | 'active' | 'completed' | 'failed' | null>(
    null
  );

  // UI Visuals
  // UI Visuals
  const [viewMode, setViewMode] = useState<'sprite' | 'mix' | 'blueprint'>('sprite');
  const [blueprintOpacity, setBlueprintOpacity] = useState(0.5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data I/O State
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [dataJson, setDataJson] = useState('');

  // Initial Load & Resizing Logic
  useEffect(() => {
    if (value) {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        let loadedPixels: string[][] = [];

        const inflateIfNeeded = (arr: unknown[]): string[][] => {
           if (!arr || arr.length === 0) return [];
           if (Array.isArray(arr[0])) return arr as string[][];
           if (typeof arr[0] === 'string') {
              const size = Math.sqrt(arr.length);
              if (Number.isInteger(size)) {
                 const inflated: string[][] = [];
                 for (let i = 0; i < size; i++) inflated.push(arr.slice(i * size, (i + 1) * size) as string[]);
                 return inflated;
              }
           }
           return [];
        };

        if (Array.isArray(parsed)) {
          loadedPixels = inflateIfNeeded(parsed);
        } else if (parsed.pixels) {
          loadedPixels = inflateIfNeeded(parsed.pixels);
          if (parsed.prompt) setPrompt(parsed.prompt);
          if (parsed.metadata) {
            setMetadata(parsed.metadata);
          }
        }

        // Resize Guard: If loaded pixels don't match grid size, pad or crop?
        if (
          loadedPixels.length !== gridHeight ||
          (loadedPixels[0] && loadedPixels[0].length !== gridWidth)
        ) {
          console.warn(
            `PixelForge: Dimension mismatch. Loaded ${loadedPixels.length}x${loadedPixels[0]?.length}, Expected ${gridWidth}x${gridHeight}. Resizing...`
          );
          // Create new empty grid of correct size
          const newGrid = Array(gridHeight)
            .fill(null)
            .map(() => Array(gridWidth).fill('transparent'));
          // Copy what fits
          for (let y = 0; y < Math.min(loadedPixels.length, gridHeight); y++) {
            for (let x = 0; x < Math.min(loadedPixels[0].length, gridWidth); x++) {
              newGrid[y][x] = loadedPixels[y][x];
            }
          }
          setPixels(newGrid);
        } else {
          setPixels(loadedPixels);
        }
      } catch (e) {
        console.error('PixelForge: Failed to parse value', e);
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
              setViewMode('mix'); // Auto-show
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
        console.error('Poll Error', err);
      }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  // Auto-Context
  useEffect(() => {
    if (!prompt && modifiedData) {
      const parts = [];
      if (modifiedData.category && typeof modifiedData.category === 'string')
        parts.push(`[${modifiedData.category}]`);
      if (modifiedData.name) parts.push(modifiedData.name);
      if (modifiedData.description) parts.push(modifiedData.description);
      if (parts.length > 0) setPrompt(parts.join(' - '));
    }
  }, [modifiedData, prompt]);

  const handleGenerate = async () => {
    if (!prompt) return;

    // Dynamic Archetype Mapping
    // `category` is used by Blueprint content-type, but Entity/Item use `type`
    const category = modifiedData.category || 'Creature';
    let type: 'Sprite' | 'Terrain' | 'Item' | 'Environment' | 'Blueprint' = 'Sprite';
    let archetype = String(modifiedData.type || 'Humanoid');

    if (modelUid === 'api::blueprint.blueprint') {
      type = 'Blueprint';
      archetype = String(modifiedData.type || 'Structure');
    } else if (
      ['Terrain', 'Environment', 'Landscape', 'Floor', 'Wall'].includes(category as string) ||
      modelUid === 'api::terrain.terrain'
    ) {
      type = 'Terrain';
      archetype = String(modifiedData.type || 'Landscape');
    } else if (
      ['Item', 'Equipment', 'Weapon', 'Armor'].includes(category as string) ||
      modelUid === 'api::item.item'
    ) {
      type = 'Item';
      archetype = String(modifiedData.type || 'Item');
    } else {
      // Default for entities
      type = 'Sprite';
      archetype = String(modifiedData.type || 'Humanoid');
    }

    setIsGenerating(true);
    setJobStatus('queued');
    try {
      const { data } = await post('/map-explorer/forge/dispatch', {
        prompt,
        type,
        archetype,
        size: 'Custom',
        model,

        // Pass Blueprint DNA if available
        blueprint: metadata?.blueprint,

        inputPixels: pixels,
        action: type === 'Blueprint' ? 'generate_blueprint' : 'generate_pixel',
        // SOTA Context Payload
        // 1. If we have an ID, we send it for Deep Fetch.
        // 2. ALWAYS send entityData (form values) as fallback/primary for Drafts.
        // NOTE: We spread modifiedData to ensure it is a plain serializable object.
        entityData: { ...modifiedData },
        entityContext: {
          uid: modelUid,
          // If new, this will be undefined, triggering the backend Fallback to entityData
          documentId: modifiedData?.documentId || modifiedData?.id,
        },
      });

      if (data.jobId) setJobId(data.jobId);
    } catch (_err) {
      setIsGenerating(false);
      setJobStatus('failed');
    }
  };

  const propagateChange = (
    newPixels: string[][],
    newPrompt: string,
    newMetadata?: Record<string, unknown>
  ) => {
    // Deflate from 2D workspace cache to 1D PNG Hex Array backing
    const flatPixels: string[] = [];
    if (newPixels && newPixels.length > 0) {
      for (const row of newPixels) {
        if (Array.isArray(row)) {
          for (const col of row) {
            flatPixels.push(col);
          }
        }
      }
    }

    onChange({
      target: {
        name,
        value: JSON.stringify({
          pixels: flatPixels,
          prompt: newPrompt,
          metadata: newMetadata || metadata,
        }),
        type: 'json',
      },
    });
  };

  const handlePixelClick = (x: number, y: number) => {
    // Allow Reference tools (Pin, Picker) OR Drawing tools (Pencil, Eraser)
    // The previous guard `!isDrawing` prevented single clicks.
    // We remove it to support click-to-draw.
    // if (!isDrawing && tool !== 'pin' && tool !== 'picker') return;

    // Clone grid for mutation
    const newPixels = pixels.map((row) => [...row]);

    // 1. PIN TOOL LOGIC
    if (tool === 'pin') {
      // Toggle Pin
      const existingSocketIndex = metadata?.sockets?.findIndex((s) => s.x === x && s.y === y);
      const newSockets = metadata?.sockets ? [...metadata.sockets] : [];

      if (existingSocketIndex !== undefined && existingSocketIndex >= 0) {
        // Remove existing
        newSockets.splice(existingSocketIndex, 1);
      } else {
        // Add new - Prompt for Label
        const label = window.prompt("Enter Socket Label (e.g., 'Center', 'Hand_R'):", 'Point');
        if (label) {
          newSockets.push({ x, y, label });
        }
      }

      const newMeta = { ...metadata, sockets: newSockets };
      setMetadata(newMeta);
      propagateChange(pixels, prompt, newMeta); // Propagate metadata change ONLY (pixels untouched)
      return;
    }

    // 2. PICKER TOOL LOGIC
    if (tool === 'picker') {
      const pickedColor = newPixels[y][x];
      if (pickedColor !== 'transparent') {
        setColor(pickedColor);
        setTool('pencil');
      }
      return;
    }

    // 3. PENCIL / ERASER LOGIC
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      newPixels[y][x] = tool === 'eraser' ? 'transparent' : color;
      setPixels(newPixels);

      // If Blueprint Mode, auto-update metadata.blueprint grid
      const newMeta = { ...metadata };
      if (modelUid === 'api::blueprint.blueprint') {
        // In BP mode, the visual grid IS the blueprint data
        newMeta.blueprint = newPixels;
      }

      propagateChange(newPixels, prompt, newMeta);
    }
  };

  // Helper to avoid browser 'prompt' blocking if desired, but for now standard prompt is fine
  const handleAutoCenter = () => {
    const matrix = pixels;
    const rows = matrix.length;
    const cols = matrix[0].length;

    let minX = cols,
      maxX = -1,
      minY = rows,
      maxY = -1;

    // Scan
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (matrix[y][x] !== 'transparent') {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1) return; // Empty

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const centerX = minX + Math.floor(width / 2);
    const centerY = minY + Math.floor(height / 2);

    const targetCenterX = Math.floor(cols / 2);
    const targetCenterY = Math.floor(rows / 2);

    const deltaX = targetCenterX - centerX;
    const deltaY = targetCenterY - centerY;

    if (deltaX === 0 && deltaY === 0) return;

    const newMatrix = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill('transparent'));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (matrix[y][x] !== 'transparent') {
          const newX = x + deltaX;
          const newY = y + deltaY;
          if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            newMatrix[newY][newX] = matrix[y][x];
          }
        }
      }
    }

    setPixels(newMatrix);
    propagateChange(newMatrix, prompt);
  };

  const handleOpenData = () => {
    setDataJson(
      JSON.stringify(
        {
          pixels,
          prompt,
          metadata,
        },
        null,
        2
      )
    );
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
        const bpRes = await get(
          '/content-manager/collection-types/api::blueprint.blueprint?page=1&pageSize=100&sort=name:ASC&populate=zones'
        );
        if (bpRes.data.results) setBlueprints(bpRes.data.results);

        // Fetch Entity Zones for Palette
        const zoneRes = await get(
          '/content-manager/collection-types/api::entity-zone.entity-zone?page=1&pageSize=100&sort=slug:ASC'
        );
        if (zoneRes.data.results) setEntityZones(zoneRes.data.results);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    if (isModalOpen) fetchData();
  }, [isModalOpen, get]);

  const handleLoadBlueprint = () => {
    const bp = blueprints.find(
      (b) => b.id === selectedBlueprintId || b.documentId === selectedBlueprintId
    );
    if (!bp || !bp.grid) return;

    // Visual Blueprint Load - Direct Color Mapping
    // The DB now stores actual HEX codes in the grid, so no conversion is needed.

    // If we are in Sprite Mode, we DON'T overwrite pixels on load, we just load the DNA into metadata
    // But currently the logic overwrites. Let's respect the user's intent:
    // If they click Load, they likely want to base their sprite on this BP.
    // However, if they just want the reference, they might not want to nuke their pixels.
    // For now, to be safe, we will ONLY load it into metadata for the Overlay,
    // unless the canvas is empty or they explicitly confirm?
    // User Habit: Load BP -> See Guidelines -> Paint.
    // So we should NOT draw the BP pixels onto the sprite canvas, but rather set them as the Overlay.

    // setPixels(newPixels); // <-- REMOVED: Don't overwrite sprite canvas with BP pixels

    setMetadata({ ...metadata, blueprint: bp.grid, loadedBlueprint: bp.name });
    propagateChange(pixels, prompt, { ...metadata, blueprint: bp.grid }); // Keep existing pixels

    // Auto-switch to Mix mode to show what happened
    setViewMode('mix');

    setPrompt(bp.description || `A ${bp.name}...`);
  };

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(dataJson);
      if (parsed.pixels) setPixels(parsed.pixels);
      if (parsed.prompt) setPrompt(parsed.prompt);
      if (parsed.metadata) setMetadata(parsed.metadata);

      propagateChange(
        parsed.pixels || pixels,
        parsed.prompt || prompt,
        parsed.metadata || metadata
      );
      setIsDataModalOpen(false);
    } catch (e) {
      console.error('Invalid JSON', e);
      alert('Invalid JSON data');
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
              width: '100%',
              height: '100%',
            }}
          >
            {pixels.map((row, y) =>
              row.map((pixelColor, x) => {
                // SOTA Logic: Handle Raw Symbols vs Hex Colors
                let finalColor = 'transparent';
                
                if (pixelColor === ' ' || pixelColor === 'transparent') {
                  finalColor = (x + y) % 2 === 0 ? '#ccc' : '#fff';
                } else if (pixelColor.startsWith('#')) {
                  finalColor = pixelColor === '#000000' ? '#1a1a1a' : pixelColor;
                } else {
                  // It's a symbol! Resolve via mapping and entityZones
                  const mapping = (modifiedData.mapping as Record<string, string>) || {};
                  const mappedSlug = mapping[pixelColor];
                  // If we found a mapped slug, look up the zone color
                  if (mappedSlug) {
                    const zone = entityZones.find(z => z.slug === mappedSlug);
                    if (zone && zone.color) {
                      finalColor = zone.color;
                    }
                  } else {
                    // Fallback: If no explicit mapping, try matching the symbol directly in zones
                    const zone = entityZones.find(z => z.symbol === pixelColor);
                    if (zone && zone.color) {
                      finalColor = zone.color;
                    } else if (pixelColor !== '') {
                       // Unknown symbol rendered as a visible placeholder if not empty
                       finalColor = '#FF00FF'; 
                    }
                  }
                }

                return (
                  <div
                    key={`p-${x}-${y}`}
                    data-testid={`pixel-${x}-${y}`}
                    onClick={() => handlePixelClick(x, y)}
                    style={{ backgroundColor: finalColor }}
                    title={!pixelColor.startsWith('#') && pixelColor !== ' ' ? `Symbol: ${pixelColor}` : undefined}
                  />
                );
              })
            )}
          </div>
        </Box>
        <Button onClick={() => setIsModalOpen(true)} startIcon={<Pencil />} variant="secondary">
          Open Pixel Forge ({gridWidth}x{gridHeight})
        </Button>
      </Flex>

      {/* SOTA Modal Editor */}
      {isModalOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={100}
          background="neutral100"
          style={{ inset: 0 }}
        >
          <Flex direction="column" height="100%" alignItems="stretch">
            {/* Header */}
            <Box background="neutral0" padding={4} shadow="filterShadow">
              <Flex justifyContent="space-between" alignItems="center">
                <Flex gap={2}>
                  <Magic />
                  <Typography variant="beta">
                    {modelUid === 'api::blueprint.blueprint'
                      ? `Blueprint Forge: ${modifiedData.category || 'Creature'}`
                      : `Pixel Forge`}
                  </Typography>
                  <Typography variant="pi" textColor="neutral600">
                    {gridWidth / 32}x{gridWidth / 32} Tiles ({gridWidth}x{gridHeight}px)
                  </Typography>
                </Flex>
                <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>
                  Save & Close
                </Button>
              </Flex>
            </Box>

            {/* Top Toolbar (Tools & Color) */}
            <Box background="neutral0" padding={2} shadow="tableShadow" zIndex={2}>
              <Flex gap={2} justifyContent="center" wrap="wrap">
                <Button
                  size="S"
                  variant={tool === 'pencil' ? 'default' : 'secondary'}
                  onClick={() => setTool('pencil')}
                >
                  <Pencil />
                </Button>
                <Button
                  size="S"
                  variant={tool === 'eraser' ? 'default' : 'secondary'}
                  onClick={() => setTool('eraser')}
                >
                  <PaintBrush />
                </Button>
                <Button
                  size="S"
                  variant={tool === 'picker' ? 'default' : 'secondary'}
                  onClick={() => setTool('picker')}
                >
                  <Eye />
                </Button>
                <Button
                  size="S"
                  variant="secondary"
                  onClick={handleAutoCenter}
                  title="Auto-Center Content"
                >
                  center
                </Button>

                <Box width="1px" background="neutral200" height="24px" margin={2} />

                {/* Dynamic Palette based on Mode */}
                {modelUid === 'api::blueprint.blueprint' ? (
                  <>
                    {/* Blueprint Mode: ZONES ONLY */}
                    <Typography variant="sigma" textColor="neutral600">
                      ZONE:
                    </Typography>

                    <SingleSelect
                      size="S"
                      placeholder="Select Zone..."
                      value={color}
                      onChange={(val: string) => {
                        setColor(val);
                        setTool('pencil');
                      }}
                      style={{ minWidth: '150px' }}
                    >
                      {entityZones
                        .filter((z) => {
                          const targetCategory = modifiedData.category || 'Creature';
                          // Loose matching to allow for case differences or 'Terrain' vs 'Structure' overlap if needed
                          // But strictly: if target is 'Creature', show 'Creature'.
                          // If target is 'Terrain', show 'Terrain' AND 'Structure' (walls are structure).
                          if (
                            ['Terrain', 'Structure'].includes(targetCategory as string) &&
                            ['Terrain', 'Structure'].includes(z.category || '')
                          ) {
                            return true;
                          }
                          return z.category === targetCategory;
                        })
                        .map((z: EntityZone) => (
                          <SingleSelectOption
                            key={z.slug}
                            value={z.color || '#000000'}
                            startIcon={
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '2px',
                                  backgroundColor: z.color || '#000000',
                                  border: '1px solid #ccc',
                                }}
                              />
                            }
                          >
                            {z.name}
                          </SingleSelectOption>
                        ))}
                    </SingleSelect>

                    <Box width="1px" background="neutral200" height="24px" margin={2} />

                    {/* PIN TOOL (Blueprint Mode Only) */}
                    <Button
                      size="S"
                      variant={tool === 'pin' ? 'default' : 'secondary'}
                      onClick={() => setTool('pin')}
                      title="Add Socket/Pin"
                      startIcon={<Pin />}
                    >
                      Pin
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Sprite Mode: Color Picker & Blueprint Overlay */}
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
                        aria-label="Color Picker"
                        onChange={(e) => {
                          setColor(e.target.value);
                          setTool('pencil');
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                        }}
                      />
                    </Box>

                    <Box width="1px" background="neutral200" height="24px" margin={2} />

                    {/* Blueprint Controls (Only in Sprite Mode) */}
                    <Flex gap={2}>
                      {blueprints.length > 0 && (
                        <SingleSelect
                          size="S"
                          placeholder="Load Blueprint..."
                          value={selectedBlueprintId}
                          onChange={setSelectedBlueprintId}
                          style={{ maxWidth: '150px' }}
                        >
                          {blueprints.map((bp) => (
                            <SingleSelectOption
                              key={bp.documentId || bp.id}
                              value={bp.documentId || bp.id}
                            >
                              {bp.name}
                            </SingleSelectOption>
                          ))}
                        </SingleSelect>
                      )}
                      <Button
                        size="S"
                        variant="secondary"
                        onClick={handleLoadBlueprint}
                        disabled={!selectedBlueprintId}
                      >
                        Load
                      </Button>
                    </Flex>

                    <Box width="1px" background="neutral200" height="24px" margin={2} />

                    {/* View Mode Controls */}
                    <Flex gap={2}>
                      <Typography variant="pi" textColor="neutral600">
                        View:
                      </Typography>
                      <Button
                        size="S"
                        variant={viewMode === 'sprite' ? 'default' : 'secondary'}
                        onClick={() => setViewMode('sprite')}
                      >
                        Sprite
                      </Button>
                      <Button
                        size="S"
                        variant={viewMode === 'mix' ? 'default' : 'secondary'}
                        onClick={() => setViewMode('mix')}
                        disabled={!metadata?.blueprint}
                      >
                        Mix
                      </Button>
                      <Button
                        size="S"
                        variant={viewMode === 'blueprint' ? 'default' : 'secondary'}
                        onClick={() => setViewMode('blueprint')}
                        disabled={!metadata?.blueprint}
                      >
                        BP
                      </Button>

                      {viewMode === 'mix' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={blueprintOpacity}
                            onChange={(e) => setBlueprintOpacity(parseFloat(e.target.value))}
                            style={{ width: '60px' }}
                            title="Blueprint Opacity"
                          />
                        </div>
                      )}
                    </Flex>
                  </>
                )}

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
                backgroundColor: '#212134', // Dark background for contrast
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
                  imageRendering: 'pixelated',
                  position: 'relative', // For absolute overlay
                }}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseUp={() => setIsDrawing(false)}
              >
                {pixels.map((row, y) =>
                  row.map((pixelColor, x) => {
                    // Zone Metadata Resolution
                    const isBlueprintMode = modelUid === 'api::blueprint.blueprint';

                    // SOTA Logic: Handle Raw Symbols vs Hex Colors
                    let resolvedPixelColor = pixelColor;
                    if (pixelColor !== ' ' && pixelColor !== 'transparent' && !pixelColor.startsWith('#')) {
                      const mapping = (modifiedData.mapping as Record<string, string>) || {};
                      const mappedSlug = mapping[pixelColor];
                      if (mappedSlug) {
                        const zone = entityZones.find(z => z.slug === mappedSlug);
                        if (zone && zone.color) {
                           resolvedPixelColor = zone.color;
                        }
                      } else {
                        const zone = entityZones.find(z => z.symbol === pixelColor);
                        if (zone && zone.color) {
                           resolvedPixelColor = zone.color;
                        } else if (pixelColor !== '') {
                           resolvedPixelColor = '#FF00FF';
                        }
                      }
                    }

                    // In BP Mode, the Pixel Color IS the Zone Color.
                    // In Sprite Mode, the Zone comes from metadata.blueprint.
                    let zoneName = '';

                    if (isBlueprintMode) {
                      const zone = entityZones.find((z) => z.color === resolvedPixelColor || z.symbol === pixelColor);
                      if (zone) zoneName = zone.name;
                    } else {
                      const blueprintColor = metadata?.blueprint?.[y]?.[x];
                      const zone = entityZones.find((z) => z.color === blueprintColor);
                      if (zone) zoneName = zone.name;
                    }

                    // Visual Layering Logic
                    // 1. Base Layer (Checkerboard)
                    const baseColor = (x + y) % 2 === 0 ? '#222' : '#2a2a2a';

                    // 2. Determine Layers
                    const spriteColor = (resolvedPixelColor === 'transparent' || resolvedPixelColor === ' ') ? null : resolvedPixelColor;
                    
                    const bpPixel = metadata?.blueprint?.[y]?.[x];
                    let resolvedBpColor = bpPixel;
                    
                    if (bpPixel && bpPixel !== ' ' && bpPixel !== 'transparent' && bpPixel !== '.' && !bpPixel.startsWith('#')) {
                      // Try to resolve symbol to color using entityZones directly
                      let zone = entityZones.find(z => z.symbol === bpPixel);
                      
                      // If fail, try to use selected blueprint's mapping if available
                      if (!zone) {
                         const selectedBp = blueprints.find(b => b.documentId === selectedBlueprintId || b.id === selectedBlueprintId);
                         const mapping = (selectedBp as unknown as { mapping?: Record<string, string> })?.mapping;
                         if (mapping) {
                            const mappedSlug = mapping[bpPixel];
                            zone = entityZones.find(z => z.slug === mappedSlug);
                         }
                      }
                      
                      if (zone && zone.color) {
                         resolvedBpColor = zone.color;
                      } else {
                         resolvedBpColor = '#FF00FF'; // Magenta for unresolved
                      }
                    }
                    
                    const bpColor =
                      resolvedBpColor && resolvedBpColor !== 'transparent' && resolvedBpColor !== '.' && resolvedBpColor !== ' ' ? resolvedBpColor : null;

                    // 3. Composite Final Color based on View Mode
                    let finalColor = baseColor;
                    let overlayStyle = {};

                    if (isBlueprintMode) {
                      // In BP Mode, pixelColor IS the zone color
                      finalColor = spriteColor || baseColor;
                    } else {
                      if (viewMode === 'sprite') {
                        finalColor = spriteColor || baseColor;
                      } else if (viewMode === 'blueprint') {
                        finalColor = bpColor || baseColor;
                      } else if (viewMode === 'mix') {
                        // Base is Sprite
                        finalColor = spriteColor || baseColor;
                        // Overlay is BP
                        if (bpColor) {
                          overlayStyle = {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: bpColor,
                            opacity: blueprintOpacity,
                            pointerEvents: 'none', // Click through to sprite
                          };
                        }
                      }
                    }

                    // Socket/Pin Logic
                    const socket = metadata?.sockets?.find((s) => s.x === x && s.y === y);

                    return (
                      <div
                        key={`${x}-${y}`}
                        title={
                          socket
                            ? `Socket: ${socket.label}`
                            : zoneName
                              ? `Zone: ${zoneName} (${x},${y})`
                              : `(${x},${y})`
                        }
                        style={{
                          backgroundColor: finalColor,
                          width: '100%',
                          height: '100%',
                          position: 'relative', // For overlay child
                          userSelect: 'none',
                          boxShadow: socket ? 'inset 0 0 0 2px #fff, inset 0 0 0 4px #000' : 'none', // Visual Marker for Socket
                        }}
                        onMouseDown={() => {
                          setIsDrawing(true);
                          handlePixelClick(x, y);
                        }}
                        onMouseEnter={() => {
                          if (isDrawing) handlePixelClick(x, y);
                        }}
                      >
                        {/* Overlay for Mix Mode */}
                        {viewMode === 'mix' && Object.keys(overlayStyle).length > 0 && (
                          <div style={overlayStyle} />
                        )}
                        {/* Legacy Overlay Logic Removed in favor of Mix Mode, but keeping clean structure */}
                      </div>
                    );
                  })
                )}
              </Box>
            </Box>

            {/* Bottom Manifestation Control */}
            <Box
              background="neutral0"
              padding={4}
              shadow="filterShadow"
              style={{ borderTop: '1px solid #eaeaef' }}
            >
              <Grid.Root gap={4}>
                <Grid.Item col={8} s={12}>
                  <Textarea
                    name="prompt"
                    placeholder="Describe the aesthetic to manifest..."
                    value={prompt}
                    onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                      setPrompt(e.target.value)
                    }
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
                    <SingleSelect placeholder="Model" size="S" value={model} onChange={setModel}>
                      <SingleSelectOption value="gemini-3-flash-preview">
                        Gemini 3 Flash Preview
                      </SingleSelectOption>
                      <SingleSelectOption value="gemini-3-pro-preview">
                        Gemini 3 Pro Preview
                      </SingleSelectOption>
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
                top={0}
                left={0}
                right={0}
                bottom={0}
                zIndex={200}
                background="neutral100"
                style={{
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
              >
                <Box
                  background="neutral0"
                  padding={6}
                  hasRadius
                  shadow="popupShadow"
                  style={{ width: '600px', maxWidth: '90%' }}
                >
                  <Typography variant="beta">Data Import/Export</Typography>
                  <Box paddingTop={4} paddingBottom={4}>
                    <Typography variant="pi" textColor="neutral600" paddingBottom={2}>
                      Copy/Paste the JSON data below to share or save.
                    </Typography>
                    <Textarea
                      style={{ height: '300px', fontFamily: 'monospace', fontSize: '12px' }}
                      value={dataJson}
                      onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                        setDataJson(e.target.value)
                      }
                    />
                  </Box>
                  <Flex gap={2} justifyContent="flex-end">
                    <Button variant="tertiary" onClick={() => setIsDataModalOpen(false)}>
                      Cancel
                    </Button>
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
