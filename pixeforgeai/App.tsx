
import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetType, Archetype, ZoneType, GenerationConfig, CreatureSize } from './types';
import { geminiService } from './services/geminiService';
import { AssetCard, PixelGrid } from './components/AssetCard';
import { BlueprintEditor } from './components/BlueprintEditor';
import { getTemplate } from './utils/templates';
import { compositeLoadout } from './utils/compositor';

const ARCHETYPES: Archetype[] = [
    'Humanoid', 'Quadruped', 'Winged', 'Ethereal', 
    'Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory',
    'Solid Block', 'Landscape/Floor'
];
const ASSET_TYPES: AssetType[] = ['Monster', 'Item', 'Race', 'Environment', 'Terrain'];
const SIZES: CreatureSize[] = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];

const MODELS = [
    { id: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Fastest)', tier: 'Lite' },
    { id: 'gemini-flash-latest', label: 'Gemini Flash (Balanced)', tier: 'Std' },
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (High IQ)', tier: 'Adv' },
    { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Max Quality)', tier: 'Pro' },
];

// Equipment Slot Configuration
const EQUIP_SLOTS = [
    { key: 'main', label: 'Main Hand', types: ['Sword', 'Polearm'] },
    { key: 'off', label: 'Off Hand', types: ['Shield'] },
    { key: 'head', label: 'Head', types: ['Headwear'] },
    { key: 'body', label: 'Body', types: ['Body Armor'] },
    { key: 'legs', label: 'Legs', types: ['Legwear'] },
    { key: 'feet', label: 'Feet', types: ['Footwear'] },
    { key: 'hands', label: 'Hands', types: ['Handwear'] }
];

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [prompt, setPrompt] = useState('');
  
  const [selectedType, setSelectedType] = useState<AssetType>('Monster');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('Humanoid');
  const [selectedSize, setSelectedSize] = useState<CreatureSize>('Medium');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  
  const [blueprint, setBlueprint] = useState<ZoneType[][]>(getTemplate('Humanoid', 'Medium'));
  const [error, setError] = useState<string | null>(null);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [showAnatomy, setShowAnatomy] = useState(false);
  
  // Multi-slot Loadout State
  const [loadout, setLoadout] = useState<Record<string, Asset | null>>({
      main: null, off: null, head: null, body: null, legs: null, feet: null, hands: null
  });
  
  const [previewGrid, setPreviewGrid] = useState<string[][] | null>(null);
  const [equipStatus, setEquipStatus] = useState<string>('');

  // Queue Management
  // We use a ref to prevent double-processing in strict mode, though the state check helps too.
  const processingRef = useRef<Set<string>>(new Set());

  // Update blueprint when type, archetype or size changes
  useEffect(() => {
    if (selectedType === 'Item' && ['Humanoid', 'Quadruped', 'Winged', 'Ethereal'].includes(selectedArchetype)) {
       setSelectedArchetype('Sword');
       setBlueprint(getTemplate('Sword', selectedSize));
    } 
    else if (selectedType === 'Monster' && !['Humanoid', 'Quadruped', 'Winged', 'Ethereal'].includes(selectedArchetype)) {
        setSelectedArchetype('Humanoid');
        setBlueprint(getTemplate('Humanoid', selectedSize));
    }
    else {
       setBlueprint(getTemplate(selectedArchetype, selectedSize));
    }
  }, [selectedType, selectedArchetype, selectedSize]);

  // Handle Equipment Composition
  useEffect(() => {
    if (activeAsset) {
        // Collect all equipped assets from loadout
        const equippedAssets = Object.values(loadout).filter(item => item !== null) as Asset[];
        
        if (equippedAssets.length > 0) {
            const { grid, status } = compositeLoadout(activeAsset, equippedAssets);
            setPreviewGrid(grid);
            setEquipStatus(status);
        } else {
            setPreviewGrid(activeAsset.pixelData);
            setEquipStatus('');
        }
    }
  }, [activeAsset, loadout]);

  // Reset loadout when opening new asset
  useEffect(() => {
    setLoadout({ main: null, off: null, head: null, body: null, legs: null, feet: null, hands: null });
    setPreviewGrid(null);
    setEquipStatus('');
  }, [activeAsset?.id]);

  // --- QUEUE PROCESSOR ---
  useEffect(() => {
    const processQueue = async () => {
        const processingCount = assets.filter(a => a.status === 'processing').length;
        const queuedAssets = assets.filter(a => a.status === 'queued');

        // MAX BUFFER: 24
        if (processingCount < 24 && queuedAssets.length > 0) {
            const nextAsset = queuedAssets[0];
            
            // Prevent double-firing
            if (processingRef.current.has(nextAsset.id)) return;
            processingRef.current.add(nextAsset.id);

            // 1. Mark as Processing
            setAssets(prev => prev.map(a => a.id === nextAsset.id ? { ...a, status: 'processing' } : a));

            try {
                const config: GenerationConfig = {
                    prompt: nextAsset.prompt,
                    type: nextAsset.type,
                    archetype: nextAsset.archetype,
                    size: nextAsset.size,
                    blueprint: nextAsset.blueprint,
                    model: nextAsset.model, // Pass the model chosen for this asset
                };

                // Returns { pixelData, enhancedPrompt }
                const result = await geminiService.generatePixelData(config);

                // 2. Success
                setAssets(prev => prev.map(a => a.id === nextAsset.id ? { 
                    ...a, 
                    status: 'ready', 
                    pixelData: result.pixelData,
                    prompt: result.enhancedPrompt // Update with the ACTUAL full prompt used
                } : a));
                
                // If this was the active asset (user watching it load), update preview
                if (activeAsset?.id === nextAsset.id) {
                    setActiveAsset(prev => prev ? { 
                        ...prev, 
                        status: 'ready', 
                        pixelData: result.pixelData,
                        prompt: result.enhancedPrompt 
                    } : null);
                }

            } catch (err) {
                console.error(`Failed to generate ${nextAsset.id}`, err);
                setAssets(prev => prev.map(a => a.id === nextAsset.id ? { ...a, status: 'error' } : a));
            } finally {
                processingRef.current.delete(nextAsset.id);
            }
        }
    };

    processQueue();
  }, [assets]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setError("Please describe your asset.");
      return;
    }
    setError(null);

    // Create a placeholder asset immediately
    const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: prompt.split(' ').slice(0, 2).join(' ') || 'Artifact',
        type: selectedType,
        archetype: selectedArchetype,
        size: selectedSize,
        pixelData: Array(32).fill(Array(32).fill('transparent')), // Empty placeholder
        blueprint: JSON.parse(JSON.stringify(blueprint)), 
        prompt: prompt, // Initially raw, updated later
        model: selectedModel,
        timestamp: Date.now(),
        status: 'queued'
    };

    setAssets(prev => [newAsset, ...prev]);
  };

  const exportAsSVG = (asset: Asset, gridOverride?: string[][]) => {
    if (asset.status !== 'ready') return;

    const dataToUse = gridOverride || asset.pixelData;
    let rects = '';
    
    dataToUse.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color && color !== 'transparent' && color !== 'none' && !color.includes('undefined')) {
          rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
        }
      });
    });

    const svgContent = `
      <svg width="1024" height="1024" viewBox="0 0 32 32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        ${rects}
      </svg>
    `.trim();

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asset.name.replace(/\s+/g, '_')}_${asset.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to update a specific slot
  const updateSlot = (slotKey: string, assetId: string) => {
      const asset = assets.find(a => a.id === assetId) || null;
      setLoadout(prev => ({ ...prev, [slotKey]: asset }));
  };
  
  const processingCount = assets.filter(a => a.status === 'processing').length;
  const queuedCount = assets.filter(a => a.status === 'queued').length;

  return (
    <div className="h-screen w-screen bg-black text-zinc-300 font-sans flex flex-col overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-amber-600 rounded-sm flex items-center justify-center shadow-lg shadow-amber-900/20">
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <h1 className="text-sm font-bold tracking-widest text-zinc-100 uppercase">Pixel<span className="text-amber-500">Forge</span> AI</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 font-mono hidden sm:block">v2.8.1_STABLE</span>
            <div className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 ${processingCount > 0 ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                {processingCount > 0 && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />}
                {processingCount > 0 ? `Forging ${processingCount}` : 'System Ready'}
                {queuedCount > 0 && <span className="opacity-50 border-l border-amber-500/30 pl-2">+{queuedCount} Queue</span>}
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="w-[400px] border-r border-zinc-800 bg-zinc-950/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
                
                {/* Section: Config */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">01. Configuration</span>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>

                    <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] text-amber-500 font-bold uppercase">Model Intelligence</label>
                        <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow"
                        >
                            {MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-400 font-medium">Asset Type</label>
                            <select 
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as AssetType)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow"
                            >
                                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-400 font-medium">Size Class</label>
                            <select 
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value as CreatureSize)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow"
                            >
                                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-medium">Archetype Structure</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar border border-zinc-900 rounded-lg p-1 bg-zinc-900/30">
                            {ARCHETYPES.map(arch => (
                                <button
                                    key={arch}
                                    onClick={() => setSelectedArchetype(arch)}
                                    className={`
                                        text-[10px] py-1.5 px-3 rounded border text-left transition-all truncate
                                        ${selectedArchetype === arch 
                                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-100' 
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                        }
                                    `}
                                >
                                    {arch}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section: Blueprint */}
                <div className="space-y-4 h-[500px] flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">02. Blueprint</span>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <div className="flex-1 min-h-0 border border-zinc-800 rounded-xl bg-black/50 p-4">
                        <BlueprintEditor 
                            blueprint={blueprint} 
                            onChange={setBlueprint} 
                            archetype={selectedArchetype}
                            size={selectedSize}
                            onReset={() => setBlueprint(getTemplate(selectedArchetype, selectedSize))}
                        />
                    </div>
                </div>

                {/* Section: Prompt */}
                <div className="space-y-4 pb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">03. Manifestation</span>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the aesthetic (e.g., 'Obsidian greatsword glowing with violet void energy')"
                        className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-zinc-600 resize-none leading-relaxed"
                    />
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        className={`
                            w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                            bg-amber-600 text-black hover:bg-amber-500 shadow-lg shadow-amber-900/20 active:scale-[0.98]
                        `}
                    >
                        Add to Queue
                    </button>
                </div>

            </div>
        </div>

        {/* --- RIGHT PANEL: GALLERY --- */}
        <main className="flex-1 bg-black relative flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Library</h2>
                <div className="flex gap-4">
                    <span className="text-[10px] text-zinc-600">{assets.length} Items</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 content-start custom-scrollbar">
                {assets.length === 0 ? (
                    <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-20">
                        <div className="w-16 h-16 border-2 border-dashed border-zinc-500 rounded-full animate-spin-slow mb-4" />
                        <p className="text-xs tracking-widest uppercase">Waiting for Input</p>
                    </div>
                ) : (
                    assets.map(asset => (
                        <AssetCard 
                            key={asset.id} 
                            asset={asset} 
                            onSelect={setActiveAsset}
                            isActive={activeAsset?.id === asset.id}
                        />
                    ))
                )}
            </div>
        </main>
      </div>

      {/* --- PREVIEW MODAL --- */}
      {activeAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setActiveAsset(null)} />
            
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col lg:flex-row h-[700px] animate-in zoom-in-95 duration-300">
                
                {/* Large Preview */}
                <div className="flex-1 bg-zinc-900/30 flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="w-full max-w-[400px] aspect-square relative shadow-2xl">
                        {activeAsset.status === 'ready' ? (
                            <PixelGrid 
                                data={previewGrid || activeAsset.pixelData} 
                                blueprint={activeAsset.blueprint}
                                showZones={showAnatomy}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center border border-zinc-800 bg-zinc-950/50 rounded-lg">
                                {activeAsset.status === 'error' ? (
                                    <div className="text-red-500 text-xs font-bold uppercase">Generation Failed</div>
                                ) : (
                                    <>
                                        <div className="w-8 h-8 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin mb-4" />
                                        <div className="text-amber-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                            {activeAsset.status === 'processing' ? 'Forging...' : 'Queued...'}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Anatomy Toggle (Only for ready assets) */}
                    {activeAsset.status === 'ready' && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                            <button 
                                onClick={() => setShowAnatomy(!showAnatomy)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                                    ${showAnatomy 
                                        ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/30' 
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${showAnatomy ? 'bg-white' : 'bg-zinc-500'}`} />
                                {showAnatomy ? 'Hide Anatomy' : 'Show Anatomy'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="w-full lg:w-96 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-800 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="mb-6 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-amber-500 font-mono">#{activeAsset.id}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{activeAsset.size}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100 mb-1 leading-none">{activeAsset.name}</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{activeAsset.type} // {activeAsset.archetype}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                                {MODELS.find(m => m.id === activeAsset.model)?.tier || 'AI'}
                            </span>
                        </div>
                    </div>
                    
                    {/* EQUIPMENT LOADOUT SECTION - UPDATED */}
                    {(activeAsset.type === 'Monster' || activeAsset.type === 'Race') && activeAsset.status === 'ready' && (
                        <div className="mb-6 shrink-0 bg-zinc-900/20 rounded-xl p-4 border border-zinc-900">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Equipment Loadout</span>
                                {equipStatus && <span className="text-[9px] text-emerald-600">Active</span>}
                            </div>
                            
                            <div className="space-y-3">
                                {EQUIP_SLOTS.map(slot => (
                                    <div key={slot.key} className="flex flex-col gap-1">
                                        <label className="text-[9px] uppercase text-zinc-500 font-bold">{slot.label}</label>
                                        <select 
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-amber-500"
                                            onChange={(e) => updateSlot(slot.key, e.target.value)}
                                            value={loadout[slot.key]?.id || ''}
                                        >
                                            <option value="">(Empty)</option>
                                            {/* Filter only READY assets */}
                                            {assets.filter(a => slot.types.includes(a.archetype) && a.status === 'ready').map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8 flex-1 min-h-[150px] flex flex-col">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Prompt Engine Output</span>
                            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-900 max-h-[150px] overflow-y-auto custom-scrollbar">
                                <p className="text-xs text-zinc-400 italic leading-relaxed whitespace-pre-wrap">
                                    {activeAsset.prompt}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-auto">
                             <div className={`w-2 h-2 rounded-full ${activeAsset.status === 'ready' ? 'bg-emerald-500' : activeAsset.status === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                             <span className="text-[10px] uppercase font-bold text-zinc-500">{activeAsset.status}</span>
                             <span className="ml-auto text-[9px] text-zinc-600 font-mono">
                                {activeAsset.model.replace('gemini-', '').replace('gemma-', '')}
                             </span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 shrink-0">
                        <button 
                            onClick={() => exportAsSVG(activeAsset, previewGrid || undefined)}
                            disabled={activeAsset.status !== 'ready'}
                            className={`
                                w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                                ${activeAsset.status === 'ready' ? 'bg-zinc-100 hover:bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}
                            `}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download SVG
                        </button>
                        <button 
                            onClick={() => setActiveAsset(null)}
                            className="w-full py-3 bg-transparent border border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
