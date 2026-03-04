import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Flex, Button, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { useForm, useFetchClient } from '@strapi/admin/strapi-admin';

interface InventoryComposerProps {
  name?: string;
  value?: Record<string, unknown>;
  onChange: (e: { target: { name: string; type: string; value: unknown } }) => void;
}

export const InventoryComposer = ({ onChange }: InventoryComposerProps) => {
  const { get } = useFetchClient();
  const formState = useForm('InventoryComposer', (state) => state);
  const modifiedData = formState?.values || {};

  // Form Field Tracking
  const entitySprite = modifiedData.sprite;
  const entityAnchors = modifiedData.anchors || [];
  const inventoryItems = modifiedData.inventory || [];

  // State
  const [dictionaryAnchors, setDictionaryAnchors] = useState<Record<string, unknown>[]>([]);
  const [loadedItemDefs, setLoadedItemDefs] = useState<Record<string, Record<string, unknown>>>({});
  
  // Loading Dictionaries & Deep Relations
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const { data } = await get('/content-manager/collection-types/api::anchor.anchor');
        if (data?.results) setDictionaryAnchors(data.results);
      } catch (_e) {
        console.error('Failed to fetch anchors for composer');
      }
    };
    fetchDictionaries();
  }, [get]);

  useEffect(() => {
    const fetchItemDefs = async () => {
      const neededIds = inventoryItems
        .map((i: Record<string, unknown>) => (i.item as Record<string, unknown>)?.id)
        .filter((id: unknown) => id && !loadedItemDefs[String(id)]);

      if (neededIds.length === 0) return;

      try {
        // Construct qs format for multiple IDs
        const qStr = neededIds.map((id: unknown, index: number) => `filters[id][$in][${index}]=${id}`).join('&');
        const { data } = await get(`/content-manager/collection-types/api::item.item?${qStr}&populate[sprite]=true&populate[anchor]=true`);
        
        if (data?.results) {
          const mapped = { ...loadedItemDefs };
          data.results.forEach((res: Record<string, unknown>) => {
            mapped[String(res.id)] = res;
          });
          setLoadedItemDefs(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch deep item defs', e);
      }
    };
    
    fetchItemDefs();
  }, [inventoryItems, loadedItemDefs, get]);

  // Derived state
  const equippedItems = useMemo(() => {
    return inventoryItems.filter((i: Record<string, unknown>) => i.isEquipped && (i.slot as Record<string, unknown>)?.id);
  }, [inventoryItems]);

  const handleToggleEquip = (invItemIndex: number, current: Record<string, unknown>) => {
    const nextArr = [...inventoryItems];
    nextArr[invItemIndex] = {
      ...nextArr[invItemIndex],
      isEquipped: !current.isEquipped,
    };
    
    // Fire Strapi Form change
    onChange({ target: { name: 'inventory', type: 'object', value: nextArr } });
  };

  const handleUpdateSlot = (invItemIndex: number, newSlotId: string) => {
    const nextArr = [...inventoryItems];
    nextArr[invItemIndex] = {
      ...nextArr[invItemIndex],
      slot: newSlotId ? { id: parseInt(newSlotId, 10) } : null,
      isEquipped: !!newSlotId, // Auto-equip if slotted
    };
    onChange({ target: { name: 'inventory', type: 'object', value: nextArr } });
  };

  return (
    <Box padding={4} background="neutral100" borderColor="neutral200" hasRadius shadow="filterShadow">
      <Typography variant="beta">Inventory Composer</Typography>
      
      {!entitySprite && (
         <Box marginTop={4} padding={4} background="warning100" hasRadius>
            <Typography variant="pi" textColor="warning700">Entity must have a Sprite uploaded to composite inventory.</Typography>
         </Box>
      )}

      {/* Visual Canvas */}
      {entitySprite && entitySprite.url && (
        <Box marginTop={6} position="relative" background="neutral0" hasRadius style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid #eaeaef' }}>
           <div style={{ position: 'relative' }}>
              {/* Draw paper doll */}
              <img src={entitySprite.url} alt="Paper Doll" style={{ display: 'block', maxWidth: '300px', imageRendering: 'pixelated' }} />
              
              {/* Draw sockets / slots */}
              {entityAnchors.map((ea: Record<string, unknown>, idx: number) => {
                  const dict = dictionaryAnchors.find((d: Record<string, unknown>) => d.id === (ea.anchor_type as Record<string, unknown>)?.id);
                  const xProp = (ea.x as number) || 0;
                  const yProp = (ea.y as number) || 0;
                  // The actual math offset. If the image is scaled up visually, we'll need to multiply by scale.
                  // For now, assuming standard 1:1 pixel rendering via CSS scale later, but let's just plot percentage or raw pixels.
                  return (
                    <div key={`socket-${idx}`} style={{
                      left: `${xProp}px`, 
                      top: `${yProp}px`,
                      width: '4px', height: '4px',
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10
                    }}>
                       <div style={{ position: 'absolute', top: '-15px', color: 'red', fontSize: '10px', whiteSpace: 'nowrap' }}>
                         {(dict?.name as string) || 'Unknown'} Slot
                       </div>
                    </div>
                  );
              })}

              {/* Draw Equipped Items (Composited) */}
              {equippedItems.map((invItem: Record<string, unknown>, idx: number) => {
                  const targetSlotAnchorId = (invItem.slot as Record<string, unknown>)?.id;
                  const targetEntityAnchor = entityAnchors.find((ea: Record<string, unknown>) => (ea.anchor_type as Record<string, unknown>)?.id === targetSlotAnchorId);
                  
                  const itemId = (invItem.item as Record<string, unknown>)?.id;
                  const itemDef = itemId ? loadedItemDefs[String(itemId)] : undefined;
                  
                  if (!targetEntityAnchor || !itemDef || !(itemDef.sprite as Record<string, unknown>)?.url) return null;

                  // Vector Subtraction
                  // Entity Target (x,y)
                  const targetX = (targetEntityAnchor.x as number) || 0;
                  const targetY = (targetEntityAnchor.y as number) || 0;
                  
                  // Item Origin (x,y)
                  const itemDefAnchor = itemDef.anchor as Record<string, unknown> | undefined;
                  const itemOriginX = (itemDefAnchor?.x as number) || 0;
                  const itemOriginY = (itemDefAnchor?.y as number) || 0;

                  // Draw Left/Top
                  const drawX = targetX - itemOriginX;
                  const drawY = targetY - itemOriginY;

                  return (
                    <img key={`composed-${idx}`} src={(itemDef.sprite as Record<string, unknown>).url as string} alt={itemDef.name as string} style={{
                        position: 'absolute',
                        left: `${drawX}px`,
                        top: `${drawY}px`,
                        imageRendering: 'pixelated',
                        zIndex: 20
                    }} />
                  );
              })}
           </div>
        </Box>
      )}

      {/* Editor Panel */}
      <Box marginTop={6}>
         <Typography variant="delta">Backpack ({inventoryItems.length} Total Items)</Typography>

         <Flex direction="column" alignItems="stretch" gap={3} marginTop={4}>
            {inventoryItems.map((invItem: Record<string, unknown>, originalIndex: number) => {
                const itemId = (invItem.item as Record<string, unknown>)?.id;
                const itemDef = itemId ? loadedItemDefs[String(itemId)] : undefined;
                const itemName = (itemDef?.name as string) || `Loading Item #${itemId}...`;
                const itemSpriteUrl = (itemDef?.sprite as Record<string, unknown>)?.url as string;
                
                return (
                  <Box key={`inv-row-${originalIndex}`} padding={3} background="neutral0" hasRadius shadow="tableShadow" borderColor="neutral200">
                     <Flex justifyContent="space-between" alignItems="center">
                        <Flex gap={3}>
                           {itemSpriteUrl && (
                             <img src={itemSpriteUrl} alt="icon" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
                           )}
                           <Box>
                             <Typography variant="omega" fontWeight="bold">{itemName}</Typography>
                             <Typography variant="pi" textColor="neutral600" style={{ display: 'block' }}>Qty: {invItem.quantity || 1}</Typography>
                           </Box>
                        </Flex>
                        
                        <Flex gap={4}>
                           <Box width="200px">
                             <SingleSelect 
                                value={(invItem.slot as Record<string, unknown>)?.id ? String((invItem.slot as Record<string, unknown>).id) : ""}
                                onChange={(val: string) => handleUpdateSlot(originalIndex, val)}
                                placeholder="Stowed (Backpack)"
                             >
                                <SingleSelectOption value="">Stowed (Backpack)</SingleSelectOption>
                                {entityAnchors.map((ea: Record<string, unknown>) => {
                                   const dict = dictionaryAnchors.find((d: Record<string, unknown>) => d.id === (ea.anchor_type as Record<string, unknown>)?.id);
                                   if (!dict) return null;
                                   return (
                                     <SingleSelectOption key={String(ea.id)} value={String(dict.id)}>Attach to: {dict.name as string}</SingleSelectOption>
                                   );
                                })}
                             </SingleSelect>
                           </Box>

                           <Button 
                             variant={invItem.isEquipped ? 'default' : 'secondary'}
                             onClick={() => handleToggleEquip(originalIndex, invItem)}
                           >
                              {invItem.isEquipped ? 'Equipped' : 'Equip'}
                           </Button>
                        </Flex>
                     </Flex>
                  </Box>
                )
            })}
         </Flex>
      </Box>

    </Box>
  );
};
