import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player, Room } from '@/types/contracts';
import cn from '@/lib/utils';
import { gildedTokens } from '@/theme/gildedTokens';
import Logo from '@/components/ui/Logo';
import JuicyLayout from '@/components/layout/JuicyLayout';
import useAuth from '../hooks/useAuth';
import { listRooms, leaveRoom } from '../services/api';
import { Button } from '../components/ui/button';
import { useI18n } from '../i18n';
import EntitySheetPanel from '../components/game/EntitySheetPanel';
import { DiceLoader } from '../components/ui/dice-loader';

interface RoomMembership {
  room: Room;
  isOwner: boolean;
  player: Player | null;
}

interface MembershipState {
  items: RoomMembership[];
  loading: boolean;
  error: string | null;
}

function formatTimestamp(timestamp: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

export default function RoomsPage() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [state, setState] = useState<MembershipState>({
    items: [],
    loading: true,
    error: null,
  });
  const [selectedContext, setSelectedContext] = useState<{ player: Player; roomId: string } | null>(null);
  const [processingRoomId, setProcessingRoomId] = useState<string | null>(null);

  const sortedMemberships = useMemo(
    () =>
      [...state.items].sort((a, b) => {
        const dateA = a.room.updatedAt ? new Date(a.room.updatedAt).getTime() : 0;
        const dateB = b.room.updatedAt ? new Date(b.room.updatedAt).getTime() : 0;
        return dateB - dateA;
      }),
    [state.items]
  );

  const errorMessage = t('rooms.messages.error');

  const fetchMemberships = useCallback(async () => {
    // If no user yet, don't fetch or just wait
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const roomsRaw = (await listRooms()) as unknown as (Room & { players: Player[]; documentId: string })[];

      // Map rooms to RoomMembership
      const memberships: RoomMembership[] = roomsRaw.map((room) => {
        const isOwner =
          (room.owner?.documentId &&
            (room.owner.documentId === user.documentId || room.owner.documentId === String(user.id))) ||
          // Fallback if legacy ownerId exists
          room.ownerId === String(user.id) ||
          room.ownerId === String(user.uid);
        const player =
          room.players?.find((p) => String(p.userId) === String(user.id) || String(p.userId) === String(user.uid)) ||
          null;
        return {
          room,
          isOwner,
          player,
        };
      });

      setState({ items: memberships, loading: false, error: null });
    } catch (error) {
      setState({
        items: [],
        loading: false,
        error: error instanceof Error ? error.message : errorMessage,
      });
    }
  }, [errorMessage, user]);

  useEffect(() => {
    if (user) {
      fetchMemberships().catch((err: unknown) => {
        console.error('Failed to fetch memberships:', err);
      });
    }
  }, [fetchMemberships, user]);

  const handleLeaveRoom = useCallback(
    async (membership: RoomMembership) => {
      if (processingRoomId) {
        return;
      }

      setProcessingRoomId(membership.room.id);
      try {
        await leaveRoom(membership.room.id);

        setState((prev) => {
          const nextItems = prev.items
            .map((item) => {
              if (item.room.id !== membership.room.id) {
                return item;
              }

              if (item.isOwner) {
                return {
                  ...item,
                  player: null,
                };
              }

              return null;
            })
            .filter((item): item is RoomMembership => item !== null);

          return {
            ...prev,
            items: nextItems,
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : errorMessage,
        }));
      } finally {
        setProcessingRoomId(null);
      }
    },
    [errorMessage, processingRoomId]
  );

  return (
    <JuicyLayout showNavbar>
      {/* Content wrapper */}
      <div className="flex w-full flex-col gap-10">
        <header className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-1000 pt-12">
          <div className="relative animate-float mb-4">
            <Logo size="xl" noShadow className="filter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]" />
            <div className="absolute inset-0 bg-aurora-500/20 blur-[50px] -z-10 rounded-full scale-150 pointer-events-none" />
          </div>

          <div className="space-y-4">
            <h1 className={`${gildedTokens.heroTitle} !text-5xl sm:!text-6xl text-shadow-100`}>{t('rooms.title')}</h1>
            <p className={`${gildedTokens.heroBody} text-aurora-100/80`}>{t('rooms.subtitle')}</p>
          </div>
        </header>

        {state.loading ? (
          <div className="flex flex-1 items-center justify-center">
            <DiceLoader size="medium" maxDiceCount={3} message={t('rooms.messages.loading') || 'Loading rooms...'} />
          </div>
        ) : state.error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-red-300">{state.error}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                fetchMemberships().catch(() => {});
              }}
            >
              {t('rooms.actions.retry')}
            </Button>
          </div>
        ) : sortedMemberships.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-semibold text-shadow-50">{t('rooms.empty.title')}</h2>
            <p className="max-w-xl text-sm text-shadow-300">{t('rooms.empty.description')}</p>
            <Button type="button" variant="default" onClick={() => navigate('/')}>
              {t('rooms.empty.cta')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedMemberships.map((membership, index) => {
              const { room, player, isOwner } = membership;

              const isProcessing = processingRoomId === room.id;
              const phaseKey = `rooms.phases.${room.phase}`;
              const phaseLabel = t(phaseKey);

              return (
                <article
                  key={room.id}
                  className={cn(
                    gildedTokens.glassPanelInteractive,
                    'p-8 animate-in fade-in slide-in-from-bottom-4 duration-700'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-aurora-400/50 bg-aurora-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-aurora-100">
                          {t(isOwner ? 'rooms.status.owner' : 'rooms.status.player')}
                        </span>
                        <span className="text-xs uppercase tracking-[0.38em] text-shadow-400">
                          {t('rooms.labels.code')}
                        </span>
                        <span className="font-mono text-lg tracking-[0.35em] text-aurora-200">{room.code}</span>
                      </div>
                      <div className="grid gap-2 text-sm text-shadow-300 sm:grid-cols-2">
                        <div>
                          <span className="block text-xs uppercase tracking-[0.35em] text-shadow-500">
                            {t('rooms.labels.phase')}
                          </span>
                          <span className="font-semibold text-shadow-50">{phaseLabel}</span>
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-[0.35em] text-shadow-500">
                            {t('rooms.labels.lastUpdated')}
                          </span>
                          <span className="font-semibold text-shadow-50">
                            {formatTimestamp(room.updatedAt, language)}
                          </span>
                        </div>
                      </div>
                      {room.worldDescription ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-shadow-200">{room.worldDescription}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button type="button" variant="default" onClick={() => navigate(`/play/${room.code}`)}>
                        {t('rooms.actions.open')}
                      </Button>
                      {player?.character ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedContext({ player, roomId: room.id })}
                          className="sm:min-w-[160px]"
                        >
                          {t('rooms.actions.viewSheet')}
                        </Button>
                      ) : null}
                      {(!isOwner || player) && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isProcessing}
                          onClick={() => {
                            handleLeaveRoom(membership).catch(() => {});
                          }}
                          className="sm:min-w-[140px]"
                        >
                          {isProcessing ? t('rooms.actions.leaving') : t('rooms.actions.leave')}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-shadow-700 bg-shadow-900/60 p-4">
                    {player?.character ? (
                      <div className="grid gap-4 text-sm text-shadow-200 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <span className="block text-xs uppercase tracking-[0.35em] text-shadow-500">
                            {t('rooms.character.name')}
                          </span>
                          <span className="font-semibold text-shadow-50">{player.character.name}</span>
                        </div>
                        <div>
                          <span className="block text-xs uppercase tracking-[0.35em] text-shadow-500">
                            {t('rooms.character.identity')}
                          </span>
                          <span className="font-semibold text-shadow-50">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(player.character.class as any)?.name || 'Unknown Class'}
                          </span>
                        </div>
                        {/* Level removed from Character schema, hiding for now or defaulted */}
                        {/* <div>
                          <span className="block text-xs uppercase tracking-[0.35em] text-shadow-500">
                            {t('rooms.character.level')}
                          </span>
                          <span className="font-semibold text-shadow-50">{player.character.level || 1}</span>
                        </div> */}
                      </div>
                    ) : isOwner ? (
                      <p className="text-sm text-shadow-300">{t('rooms.status.ownerNoCharacter')}</p>
                    ) : (
                      <p className="text-sm text-shadow-300">{t('rooms.status.noCharacter')}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <EntitySheetPanel
        player={selectedContext?.player || null}
        roomId={selectedContext?.roomId}
        onClose={() => setSelectedContext(null)}
      />
    </JuicyLayout>
  );
}
