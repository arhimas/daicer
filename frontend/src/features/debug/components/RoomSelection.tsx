import { useQuery } from '@apollo/client/react';
import { Plus, Users, ScrollText, Calendar, Loader2 } from 'lucide-react';
import { LIST_ROOMS_QUERY } from '@/graphql/queries';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { gildedTokens } from '@/theme/gildedTokens';
import cn from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

interface RoomSelectionProps {
  onSelect: (roomId: string) => void;
  onCreate: () => void;
}

export function RoomSelection({ onSelect, onCreate }: RoomSelectionProps) {
  const { data, loading, error } = useQuery(LIST_ROOMS_QUERY);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-aurora-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-8 text-center text-red-300 backdrop-blur-sm">
        <p>Unable to load campaigns</p>
        <p className="text-sm opacity-70 mt-2">{error.message}</p>
      </div>
    );
  }

  interface Room {
    documentId: string;
    roomId?: string;
    code?: string;
    dmSettings?: {
      theme?: string;
      difficulty?: string;
    };
    players?: unknown[];
    entity_sheets?: unknown[];
    createdAt?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rooms = ((data as any)?.rooms as Room[]) || [];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="relative animate-float mb-4">
          <Logo size="xl" noShadow className="filter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]" />
          <div className="absolute inset-0 bg-aurora-500/20 blur-[50px] -z-10 rounded-full scale-150 pointer-events-none" />
        </div>

        <div className="space-y-4">
          <p className={gildedTokens.heroEyebrow}>Campaign Select</p>
          <h1 className={`${gildedTokens.heroTitle} !text-5xl sm:!text-6xl text-shadow-100 leading-tight`}>
            Game Lobby
          </h1>
          <p className={`${gildedTokens.heroBody} text-aurora-100/80`}>
            Select an existing campaign or start a new adventure
          </p>
        </div>

        <Button onClick={onCreate} className={cn(gildedTokens.primaryAction, 'mt-4')}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </header>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-aurora-500/20 to-transparent" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Create New Room Card */}
        <div
          onClick={onCreate}
          className={cn(
            gildedTokens.glassPanelInteractive,
            'flex flex-col items-center justify-center p-8 cursor-pointer min-h-[280px] group border-dashed border-aurora-500/30 hover:border-aurora-400'
          )}
        >
          <div className="mb-6 rounded-full bg-midnight-900/80 p-5 shadow-[0_0_30px_rgba(211,143,31,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(211,143,31,0.25)] transition-all duration-300 border border-aurora-500/20">
            <Plus className="h-8 w-8 text-aurora-300" />
          </div>
          <h3 className="font-display text-xl uppercase tracking-[0.15em] text-aurora-200">New Campaign</h3>
          <p className="mt-3 text-center text-sm text-shadow-300 max-w-[200px]">
            Configure a new world with custom AI settings
          </p>
        </div>

        {/* Existing Rooms */}
        {rooms.map((room) => (
          <Card
            key={room.documentId}
            className={cn(
              gildedTokens.glassPanelInteractive,
              'p-0 overflow-hidden flex flex-col cursor-pointer border-midnight-700/50 bg-midnight-900/40' // Override base p-8
            )}
            onClick={() => onSelect(room.documentId)}
          >
            {/* Gradient Top Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-aurora-600/50 via-aurora-400/50 to-aurora-600/50 opacity-70" />

            <CardHeader className="p-6 pb-2 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-display text-xl leading-tight uppercase tracking-wider text-shadow-100 group-hover:text-aurora-300 transition-colors line-clamp-2">
                  {room.roomId || 'Untitled Room'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-midnight-950/50 px-2 py-1 font-mono text-xs tracking-widest text-shadow-400 border border-white/5">
                  {room.code || 'NO-CODE'}
                </span>
                {room.dmSettings?.theme && (
                  <span className="rounded bg-aurora-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-aurora-300 border border-aurora-500/20">
                    {room.dmSettings.theme}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-4 flex-1">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium uppercase tracking-wider text-shadow-400">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-aurora-500/60" />
                  <span>{room.players?.length || 0} Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScrollText className="w-3.5 h-3.5 text-aurora-500/60" />
                  <span>{room.entity_sheets?.length || 0} Sheets</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-white/5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-aurora-500/60" />
                  <span>Updated {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-midnight-950/30 p-4 border-t border-white/5">
              <div className="w-full text-center text-xs font-bold uppercase tracking-[0.25em] text-shadow-500 group-hover:text-aurora-300 transition-colors">
                Enter Campaign
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
