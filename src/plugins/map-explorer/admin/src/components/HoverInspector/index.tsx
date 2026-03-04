import React from 'react';
import { Box, Typography, Flex } from '@strapi/design-system';
import { Chunk, TerrainType } from '../../types';

interface HoveredCell {
  chunkX: number;
  chunkY: number;
  tileX: number;
  tileY: number;
  mouseX: number;
  mouseY: number;
}

interface HoverInspectorProps {
  hoveredCell: HoveredCell | null;
  chunks: Map<string, Chunk>;
  terrains: TerrainType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  currentZ: number;
}

export const HoverInspector: React.FC<HoverInspectorProps> = ({
  hoveredCell,
  chunks,
  terrains,
  entities,
  items,
  currentZ,
}) => {
  if (!hoveredCell) return null;

  const { chunkX, chunkY, tileX, tileY, mouseX, mouseY } = hoveredCell;
  const chunkKey = `${chunkX},${chunkY}`;
  const chunk = chunks.get(chunkKey);

  // 1. Resolve Terrain
  let terrainName = 'Air / Empty';
  if (chunk && chunk.tiles && chunk.tiles[currentZ] && chunk.tiles[currentZ][tileY]) {
    const tile = chunk.tiles[currentZ][tileY][tileX];
    if (tile && tile.block !== 'air') {
      const terrain = terrains.find((t) => t.slug === tile.block || t.name === tile.block);
      terrainName = terrain ? terrain.name : tile.block;
    }
  }

  // Calculate Global Grid Coordinate
  // Chunk Size 16. So Global (X) = chunkX * 16 + tileX
  const globalX = chunkX * 16 + tileX;
  const globalY = chunkY * 16 + tileY;

  // 2. Resolve Entities (Multi-cell boundary check)
  const overlappingEntities = entities.filter((ent) => {
    if (!ent.position || ent.position.z !== currentZ) return false;
    const originX = ent.position.x;
    const originY = ent.position.y;
    const width = ent.width || 1;
    const height = ent.height || 1;

    // Is the global coordinate inside the bounding box of the entity?
    return (
      globalX >= originX &&
      globalX < originX + width &&
      globalY >= originY &&
      globalY < originY + height
    );
  });

  // 3. Resolve Items (Cell exact match)
  const overlappingItems = items.filter((item) => {
    if (!item.position || item.position.z !== currentZ) return false;
    return item.position.x === globalX && item.position.y === globalY;
  });

  return (
    <Box
      background="neutral0"
      shadow="filterShadow"
      hasRadius
      padding={3}
      style={{
        position: 'fixed',
        top: mouseY + 15, // Offset slightly so cursor doesn't block it
        left: mouseX + 15,
        zIndex: 9999,
        pointerEvents: 'none', // Don't block dragging!
        border: '1px solid var(--strapi-colors-neutral200)',
        minWidth: '200px',
      }}
    >
      <Flex direction="column" alignItems="flex-start" gap={2}>
        <Typography variant="sigma" textColor="primary600">
          Grid [{globalX}, {globalY}]
        </Typography>
        
        <Box>
          <Typography variant="pi" fontWeight="bold">Terrain:</Typography>
          <Typography variant="omega" display="block">{terrainName}</Typography>
        </Box>

        {overlappingEntities.length > 0 && (
          <Box>
            <Typography variant="pi" fontWeight="bold">Entity:</Typography>
            {overlappingEntities.map((ent, i) => (
              <Typography key={i} variant="omega" display="block">
                {ent.name || 'Unknown Entity'}
              </Typography>
            ))}
          </Box>
        )}

        {overlappingItems.length > 0 && (
          <Box>
            <Typography variant="pi" fontWeight="bold">Items ({overlappingItems.length}):</Typography>
            {overlappingItems.map((item, i) => (
              <Typography key={i} variant="omega" display="block">
                • {item.name || 'Unknown Item'}
              </Typography>
            ))}
          </Box>
        )}
      </Flex>
    </Box>
  );
};
