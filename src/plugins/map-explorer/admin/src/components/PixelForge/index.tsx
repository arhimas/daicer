import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Flex,
  Textarea,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { Magic, Pin, Trash, Check } from '@strapi/icons';
import { useFetchClient, useForm } from '@strapi/admin/strapi-admin';
import { useParams } from 'react-router-dom';

interface PixelForgeProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string; type: string } }) => void;
}

interface Socket {
  x: number;
  y: number;
  label: string;
  id?: number; // DB ID of the dictionary anchor
}

interface PixelForgeMetadata {
  sockets?: Socket[];
  [key: string]: unknown;
}

interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  name?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
}

interface EntityData {
  id?: number | string;
  documentId?: string;
  type?: string;
  category?: string;
  name?: string;
  description?: string;
  sprite?: StrapiMedia | StrapiMedia[];
  blueprint?: {
    id: number;
    documentId: string;
    name: string;
    spriteProcessed?: StrapiMedia | StrapiMedia[];
    spriteOriginal?: StrapiMedia | StrapiMedia[];
    spriteData?: string[] | string[][];
  };
  [key: string]: unknown;
}

interface AnchorDictionary {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

/**
 * **Image & Anchor Forge (Replaces PixelForge)**
 *
 * A streamlined component for generating AI Sprites (PNGs) and
 * defining Anchor coordinates (Sockets) for equipment compositing.
 */
export const PixelForge = ({ name, value, onChange }: PixelForgeProps) => {
  const { post, get } = useFetchClient();
  const params = useParams<{ slug?: string; id?: string; collectionType?: string; model?: string }>();
  
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const fallbackId = pathParts.pop();
  const fallbackUid = pathParts.pop();

  const formState = useForm('PixelForge', (state) => state);
  const formValues = formState?.values;
  const modifiedData = (formValues || {}) as EntityData;
  const finalDocumentId = modifiedData?.documentId || modifiedData?.id || params?.id || (fallbackId !== 'create' ? fallbackId : undefined);
  const modelUid = params.slug || params.collectionType || params.model || fallbackUid;

  // State
  const [metadata, setMetadata] = useState<PixelForgeMetadata>({});
  
  // AI State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'queued' | 'active' | 'completed' | 'failed' | null>(null);
  
  // Ephemeral preview image from Generation via Base64 before DB refresh
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // UI Hover state for coordinates mapping
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  // Dictionary State
  const [dictionaryAnchors, setDictionaryAnchors] = useState<AnchorDictionary[]>([]);
  const [activePicker, setActivePicker] = useState<{ x: number; y: number } | null>(null);
  const [pickerSelection, setPickerSelection] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    if (value) {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.metadata) setMetadata(parsed.metadata);
        if (parsed.sockets && !parsed.metadata?.sockets) {
          // Fallback for flat structure
          setMetadata(prev => ({ ...prev, sockets: parsed.sockets }));
        }
      } catch (e) {
        console.error('ImageAnchors: Failed to parse value', e);
      }
    }
  }, [value]);

  // Auto-center hack for Terrains on mount
  useEffect(() => {
    if (modelUid === 'api::terrain.terrain') {
       if (!metadata.sockets || metadata.sockets.length === 0) {
           const autoSockets = [{ x: 16, y: 16, label: 'center' }];
           setMetadata(prev => {
             // Only update if actually different to prevent infinite loops
             if (prev.sockets && prev.sockets.length > 0) return prev;
             const next = { ...prev, sockets: autoSockets };
             // We delay propagation slightly so it doesn't fight the initial unmounting/mounting value injections
             setTimeout(() => propagateChange(prompt, next), 100);
             return next;
           });
       }
    }
  }, [modelUid, metadata.sockets]);

  // Auto-Context Prompt Builder
  useEffect(() => {
    if (!prompt && modifiedData) {
      const parts = [];
      const typeOrCat = modifiedData.category || modifiedData.type;
      if (typeOrCat && typeof typeOrCat === 'string') parts.push(`[${typeOrCat}]`);
      if (modifiedData.name) parts.push(modifiedData.name);
      if (modifiedData.description) parts.push(modifiedData.description);
      
      if (parts.length > 0) {
        setPrompt(parts.join(' - '));
      } else {
        setPrompt('Generate Asset');
      }
    }
  }, [modifiedData, prompt]);

  // Fetch Anchor Dictionary
  useEffect(() => {
    const fetchAnchors = async () => {
       try {
         const { data } = await get('/content-manager/collection-types/api::anchor.anchor');
         if (data?.results) setDictionaryAnchors(data.results);
       } catch (e) {
         console.error('Failed to fetch anchors', e);
       }
    };
    fetchAnchors();
  }, [get]);

  // Sync internal Sockets array to the Strapi Relational Form Components
  const syncToStrapiForm = (sockets: Socket[]) => {
      // Map to Strapi Component Structure representing the dictionary relations
      const componentData = sockets.map(s => ({
          __component: 'game.anchor-slot',
          x: s.x,
          y: s.y,
          anchor_type: s.id ? { connect: [{ id: s.id, position: { end: true } }] } : null
      }));

      // Entity has Repeatable Component (Array)
      if (modelUid === 'api::entity.entity') {
          onChange({ target: { name: 'anchors', value: componentData, type: 'component' } } as unknown as React.ChangeEvent<HTMLInputElement>);
      } 
      // Item/Terrain have Single Component (Object)
      else if (['api::item.item', 'api::terrain.terrain'].includes(modelUid || '')) {
          onChange({ target: { name: 'anchor', value: componentData.length > 0 ? componentData[0] : null, type: 'component' } } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
  };

  // Handle Generate
  const handleGenerate = async () => {
    if (!prompt) return;

    const category = modifiedData.category || 'Creature';
    let type = 'Sprite';
    let archetype = String(modifiedData.type || 'Humanoid');

    if (['Terrain', 'Environment'].includes(category as string) || modelUid === 'api::terrain.terrain') {
      type = 'Terrain';
      archetype = String(modifiedData.type || 'Landscape');
    } else if (['Item', 'Equipment'].includes(category as string) || modelUid === 'api::item.item') {
      type = 'Item';
      archetype = String(modifiedData.type || 'Item');
    }

    setIsGenerating(true);
    setJobStatus('queued');
    try {
      // Clean payload
      const safePayload: Record<string, unknown> = {};
      for (const key in modifiedData) {
         const val = modifiedData[key];
         if (val !== null && val !== undefined && (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')) {
            safePayload[key] = val;
         }
      }

      const { data } = await post('/map-explorer/forge/dispatch', {
        prompt,
        type,
        archetype,
        size: modifiedData.size || 'Custom',
        model: 'gemini-3.1-flash-image-preview',
        action: 'generate_image',
        entityData: safePayload,
        entityContext: {
          uid: modelUid,
          documentId: finalDocumentId,
        },
      });

      if (data.jobId) setJobId(data.jobId);
    } catch (_err) {
      setIsGenerating(false);
      setJobStatus('failed');
    }
  };

  // Poll Job Status
  useEffect(() => {
    if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return;

    const poll = async () => {
      try {
        const { data } = await get(`/map-explorer/forge/status/${jobId}`);
        setJobStatus(data.state);

        if (data.state === 'completed' && data.result) {
          if (data.result.base64Processed) {
            setPreviewImage(data.result.base64Processed);
          } else if (data.result.base64Original) {
            setPreviewImage(data.result.base64Original);
          }
          
          let newMetadata = metadata;

          // Auto-centering hack for Terrain based on User Request
          if (modelUid === 'api::terrain.terrain') {
             // Let's assume a default center anchor if it's a terrain
             if (!metadata.sockets || metadata.sockets.length === 0) {
                 const autoSockets = [{ x: 16, y: 16, label: 'center' }]; // Default center for a 32x32 terrain
                 newMetadata = { ...metadata, sockets: autoSockets };
                 setMetadata(newMetadata);
             }
          }

          propagateChange(data.result.enhancedPrompt || prompt, newMetadata);
          
          // CRITICAL: We need to update the actual `sprite` field in the Strapi Form
          // so that the user doesn't overwrite it with null if they click Save.
          // The backend service will return the media ID / Object if it uploaded successfully.
          if (data.result.uploadMedia || data.result.uploadId) {
             const mediaObj = data.result.uploadMedia || { id: data.result.uploadId };
             console.log(`[PixelForge] Injecting Sprite Object:`, mediaObj);
             // Strapi 5 uses a full array format for the payload of relation changes (e.g., adding/removing).
             // But for single Media fields, setting it to the object or array of the object usually works.
             // Best practice for single media widget is to provide the object.
             onChange({
                 target: {
                     name: 'sprite',
                     value: mediaObj,
                     type: 'media'
                 }
             });
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
  }, [jobId, jobStatus, modelUid, prompt, metadata]);

  const propagateChange = (newPrompt: string, newMetadata: PixelForgeMetadata) => {
    onChange({
      target: {
        name,
        value: JSON.stringify({
          prompt: newPrompt,
          metadata: newMetadata,
        }),
        type: 'json',
      },
    });
    // Trigger external component sync whenever metadata sockets change
    if (newMetadata.sockets) {
       syncToStrapiForm(newMetadata.sockets);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    
    // Calculate click relative to image native size
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    // Absolute pixel coordinates map.
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setActivePicker({ x, y });
  };

  const confirmSocketSelection = () => {
    if (!activePicker || !pickerSelection) return;
    const selectedAnchor = dictionaryAnchors.find(a => String(a.id) === pickerSelection);
    if (!selectedAnchor) return;

    const newSockets = [...(metadata.sockets || [])];
    const existingIdx = newSockets.findIndex(s => s.id === selectedAnchor.id);
    
    if (existingIdx >= 0) {
      newSockets[existingIdx] = { x: activePicker.x, y: activePicker.y, label: selectedAnchor.name, id: selectedAnchor.id };
    } else {
      newSockets.push({ x: activePicker.x, y: activePicker.y, label: selectedAnchor.name, id: selectedAnchor.id });
    }
    
    const newMeta = { ...metadata, sockets: newSockets };
    setMetadata(newMeta);
    propagateChange(prompt, newMeta);
    setActivePicker(null);
    setPickerSelection(null);
  };

  const removeSocket = (label: string) => {
    if (!metadata.sockets) return;
    const newSockets = metadata.sockets.filter(s => s.label !== label);
    const newMeta = { ...metadata, sockets: newSockets };
    setMetadata(newMeta);
    propagateChange(prompt, newMeta);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setHoverCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  // Resolve Image to display
  let displayUrl: string | null = null;

  if (previewImage) {
    displayUrl = previewImage;
  } else if (modifiedData.sprite) {
    const s = modifiedData.sprite;
    if (Array.isArray(s) && s[0]?.url) displayUrl = s[0].url;
    else if (!Array.isArray(s) && s.url) displayUrl = s.url;
  }

  return (
    <Box background="neutral0" padding={4} shadow="filterShadow" hasRadius>
      <Flex direction="column" alignItems="stretch" gap={4}>
        
        {/* Header */}
        <Flex justifyContent="space-between">
          <Flex gap={2}>
            <Pin />
            <Typography variant="beta">Image & Anchors Forge</Typography>
          </Flex>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !finalDocumentId}
            startIcon={<Magic />}
            loading={isGenerating}
            size="S"
          >
            {finalDocumentId ? 'Generate Image' : 'Save Entry First to Generate'}
          </Button>
        </Flex>

        {/* Workspace */}
        <Flex gap={4} direction="row" alignItems="flex-start">
          
          {/* Active Image & Anchor Canvas */}
          <Box
            background="neutral150"
            borderColor="neutral200"
            style={{
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'min(100%, 65vh)', 
              aspectRatio: '1/1',
              border: '1px solid #dcdce4',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'crosshair',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {displayUrl ? (
              <>
                <img 
                  ref={imageRef}
                  src={displayUrl} 
                  alt="Asset Sprite" 
                  onClick={handleImageClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                     width: '100%',
                     height: '100%',
                     objectFit: 'contain',
                     imageRendering: 'pixelated',
                     opacity: 1.0,
                  }}
                />
              </>
            ) : (
              <Typography textColor="neutral500" variant="pi">No Image (Upload or Generate)</Typography>
            )}

            {/* Hover Coordinates Overlay */}
            {hoverCoords && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.8)',
                color: '#49ff68', // HSL tailored Matrix green
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                pointerEvents: 'none',
                fontFamily: 'monospace',
                zIndex: 10,
                boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                fontWeight: 'bold'
              }}>
                [ {hoverCoords.x}, {hoverCoords.y} ]
              </div>
            )}

            {/* Overlay Sockets */}
            {metadata.sockets?.map((s, i) => {
              if (!imageRef.current) return null;
              
              // Map native coordinates back to current rendered size
              const rect = imageRef.current.getBoundingClientRect();
              const scaleX = rect.width / imageRef.current.naturalWidth;
              const scaleY = rect.height / imageRef.current.naturalHeight;
              
              // Center of the image container + offset
              const displayX = s.x * scaleX;
              const displayY = s.y * scaleY;

              return (
                <div
                  key={i}
                  title={s.label}
                  style={{
                    position: 'absolute',
                    left: `${displayX}px`, 
                    top: `${displayY}px`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#FF0055',
                    border: '2px solid white',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }}
                >
                  <span style={{ 
                    position: 'absolute', top: '-20px', left: '-50%', whiteSpace: 'nowrap',
                    background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px'
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}

            {/* Inline Anchor Picker Overlay */}
            {activePicker && (
               <Box style={{
                 position: 'absolute',
                 top: '50%',
                 left: '50%',
                 transform: 'translate(-50%, -50%)',
                 background: 'white',
                 padding: '16px',
                 borderRadius: '8px',
                 boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                 zIndex: 100,
                 width: '240px'
               }}>
                 <Typography variant="pi" fontWeight="bold">Link Anchor at [{activePicker.x}, {activePicker.y}]</Typography>
                 <Box marginTop={2} marginBottom={4}>
                    <SingleSelect
                      placeholder="Select Anchor Dictionary"
                      value={pickerSelection}
                      onChange={(val: string) => setPickerSelection(val)}
                    >
                      {dictionaryAnchors.map(a => (
                        <SingleSelectOption key={a.id} value={String(a.id)}>{a.name}</SingleSelectOption>
                      ))}
                    </SingleSelect>
                 </Box>
                 <Flex gap={2}>
                    <Button size="S" variant="secondary" onClick={() => setActivePicker(null)}>Cancel</Button>
                    <Button size="S" startIcon={<Check />} disabled={!pickerSelection} onClick={confirmSocketSelection}>Confirm</Button>
                 </Flex>
               </Box>
            )}
          </Box>

          {/* Panel Controls */}
          <Flex direction="column" gap={4} style={{ flex: 1 }}>
            <Box>
              <Typography variant="pi" fontWeight="bold">Prompt Generator</Typography>
              <Textarea
                name="prompt"
                placeholder="Describe the asset..."
                value={prompt}
                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setPrompt(e.target.value)}
                style={{ height: '80px', marginTop: '8px' }}
              />
            </Box>

            <Box>
              <Typography variant="pi" fontWeight="bold">Defined Anchors</Typography>
              <Box background="neutral100" padding={2} marginTop={2} style={{ borderRadius: '4px', minHeight: '100px' }}>
                {metadata.sockets && metadata.sockets.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {metadata.sockets.map(s => (
                      <li key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eaeaef' }}>
                        <Typography variant="pi">{s.label}: [{s.x}, {s.y}]</Typography>
                        <Button variant="danger-light" size="S" startIcon={<Trash />} onClick={() => removeSocket(s.label)}>Remove</Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="pi" textColor="neutral500">No anchors defined. Click on the image to add.</Typography>
                )}
              </Box>
            </Box>

          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PixelForge;
