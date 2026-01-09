import { useState } from 'react';
import { X, Plus, Search, Skull, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Player, Creature, EntitySheet } from '@/types/contracts';
import { useMutation } from '@apollo/client/react';
import { Button } from '../ui/button';
import Input from '../ui/input';
import Label from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { SPAWN_CREATURE_MUTATION } from '../../graphql/mutations';

import { UniversalEntitySheetContent } from '../game/UniversalEntitySheet';

interface EntityListModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatures: Creature[];
  players?: Player[];
  roomId: string;
}

// Helper Type for Union
type SelectableEntity = Creature | Player;

// Helper to adapt to EntitySheet for Universal Viewer
function getEntitySheet(entity: SelectableEntity): EntitySheet | null {
  if ('sheet' in entity && entity.sheet) return entity.sheet;
  if ('character' in entity && entity.character) return entity.character as unknown as EntitySheet;
  // If it's a monster with flat fields, adapt it (simple stub or check if entity itself is EntitySheet-like)
  // EntityListModal uses `Creature` which has hp, maxHp, ac, etc.
  // UniversalEntitySheetContent expects EntitySheet.
  // We might need to map it on the fly if it's not a full sheet.
  // But Phase 1/3 standardized entities to have 'sheet' or be compatible?
  // Let's assume best effort mapping if needed.

  // Temporary mapping for "Creature" without nested "sheet" property (if legacy)
  if (!('sheet' in entity) && !('character' in entity)) {
    // It's a raw creature/monster
    const c = entity as Creature;
    return {
      id: c.id,
      name: c.name,
      type: c.type === 'monster' ? 'monster' : 'npc',
      hp: c.hp,
      maxHp: c.maxHp,
      ac: c.ac,
      speed: 30, // Fallback
      level: 'level' in c ? (c as { level: number }).level : 1,
      stats:
        'stats' in c
          ? (c as { stats: EntitySheet['stats'] }).stats
          : {
              strength: 10,
              dexterity: 10,
              constitution: 10,
              intelligence: 10,
              wisdom: 10,
              charisma: 10,
            },
      // Actions?
      actions: [],
      features: [],
    } as unknown as EntitySheet;
  }
  return null;
}

function SafeSheetView({ entity }: { entity: SelectableEntity }) {
  const sheet = getEntitySheet(entity);
  if (!sheet) return <div className="p-6 text-midnight-400 italic">No sheet data available for this entity.</div>;

  // UniversalEntitySheetContent takes full height, ensure container handles it.
  return <UniversalEntitySheetContent entity={sheet} />;
}

export function EntityListModal({ isOpen, onClose, creatures, players = [], roomId }: EntityListModalProps) {
  const [selectedEntity, setSelectedEntity] = useState<SelectableEntity | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCreature, setNewCreature] = useState({
    type: 'npc', // or 'monster'
    name: '',
    race: '',
    class: '',
    level: 1,
    monsterId: '',
    cr: 0.25,
  });
  const [loading, setLoading] = useState(false);

  const [spawnCreature] = useMutation(SPAWN_CREATURE_MUTATION);

  if (!isOpen) return null;

  const handleAddCreature = async () => {
    try {
      setLoading(true);
      await spawnCreature({
        variables: {
          roomId,
          creature: newCreature,
        },
      });
      toast.success('Creature spawned!');
      setIsAdding(false);
      setNewCreature({ ...newCreature, name: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to spawn creature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[80vh] bg-midnight-900 border border-midnight-700 rounded-xl shadow-2xl flex overflow-hidden">
        {/* Left Sidebar: List */}
        <div className="w-1/3 border-r border-midnight-700 flex flex-col bg-midnight-950/50">
          <div className="p-4 border-b border-midnight-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-aurora-100">Entities</h2>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(!isAdding)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <ScrollArea className="flex-1 p-2">
            {/* Players Section */}
            {players.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider text-midnight-400 font-bold mb-2 px-2">Players</h3>
                <div className="space-y-1">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedEntity(p);
                        setIsAdding(false);
                      }}
                      className={`p-2 rounded cursor-pointer flex items-center gap-2 hover:bg-midnight-800 ${selectedEntity?.id === p.id ? 'bg-midnight-800 border border-aurora-500/30' : ''}`}
                    >
                      <User className="w-4 h-4 text-aurora-400" />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-sm truncate text-aurora-100">
                          {p.character?.name || p.name}
                        </div>
                        <div className="text-xs text-midnight-400 truncate">
                          {typeof p.character?.race === 'string' ? p.character.race : p.character?.race?.name}{' '}
                          {typeof p.character?.class === 'string'
                            ? p.character.class
                            : p.character?.class?.name || p.character?.characterClass}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creatures Section */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-midnight-400 font-bold mb-2 px-2">
                Creatures & NPCs
              </h3>
              {creatures.length === 0 && <p className="text-xs text-midnight-500 px-2">No creatures active.</p>}
              <div className="space-y-1">
                {creatures.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedEntity(c);
                      setIsAdding(false);
                    }}
                    className={`p-2 rounded cursor-pointer flex items-center gap-2 hover:bg-midnight-800 ${selectedEntity?.id === c.id ? 'bg-midnight-800 border border-nebula-500/30' : ''}`}
                  >
                    <Skull className={`w-4 h-4 ${c.type === 'monster' ? 'text-red-400' : 'text-nebula-400'}`} />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-sm truncate text-gray-200">{c.name}</div>
                      <div className="text-xs text-midnight-400 truncate">
                        HP: {c.hp}/{c.maxHp} | AC: {c.ac}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 flex flex-col bg-midnight-900 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-midnight-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {isAdding ? (
            <div className="p-6 max-w-md mx-auto w-full">
              <h2 className="text-2xl font-bold mb-6 text-aurora-100">Spawn Creature</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={newCreature.type === 'npc' ? 'default' : 'outline'}
                    onClick={() => setNewCreature({ ...newCreature, type: 'npc' })}
                    className="flex-1"
                  >
                    NPC
                  </Button>
                  <Button
                    variant={newCreature.type === 'monster' ? 'default' : 'outline'}
                    onClick={() => setNewCreature({ ...newCreature, type: 'monster' })}
                    className="flex-1"
                  >
                    Monster
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newCreature.name}
                    onChange={(e) => setNewCreature({ ...newCreature, name: e.target.value })}
                    placeholder={newCreature.type === 'npc' ? 'Falric the Guard' : 'Goblin Skirmisher'}
                  />
                </div>

                {newCreature.type === 'npc' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Race</Label>
                        <Input
                          value={newCreature.race}
                          onChange={(e) => setNewCreature({ ...newCreature, race: e.target.value })}
                          placeholder="Human"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Class</Label>
                        <Input
                          value={newCreature.class}
                          onChange={(e) => setNewCreature({ ...newCreature, class: e.target.value })}
                          placeholder="Fighter"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Input
                        type="number"
                        value={newCreature.level}
                        onChange={(e) => setNewCreature({ ...newCreature, level: parseInt(e.target.value, 10) })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Monster Filter (Type/Race)</Label>
                      <Input
                        value={newCreature.race}
                        onChange={(e) => setNewCreature({ ...newCreature, race: e.target.value })}
                        placeholder="e.g. Goblin, Undead"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Challenge Rating (approx)</Label>
                      <Input
                        type="number"
                        step="0.125"
                        value={newCreature.cr}
                        onChange={(e) => setNewCreature({ ...newCreature, cr: parseFloat(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                <Button
                  className="w-full mt-6 bg-aurora-600 hover:bg-aurora-700"
                  onClick={handleAddCreature}
                  disabled={loading}
                >
                  {loading ? 'Summoning...' : 'Spawn Entity'}
                </Button>
              </div>
            </div>
          ) : selectedEntity ? (
            <div className="flex-1 flex flex-col h-full bg-midnight-950 overflow-hidden">
              {/* Clean Header - just the content, as Content handles header */}
              <SafeSheetView entity={selectedEntity} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-midnight-500 flex-col gap-4">
              <Search className="w-16 h-16 opacity-20" />
              <p>Select an entity to view their sheet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
