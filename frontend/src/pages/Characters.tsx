import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player } from '@/types/contracts';
import { listRooms } from '../services/api';
import { PrivateLayout } from '../components/layout';
import { Button } from '../components/ui/button';
import { useI18n } from '../i18n';
import EntitySheetPanel from '../components/game/EntitySheetPanel';

interface CharacterWithRoom {
  character: Player['character'];
  player: Player;
  roomId: string;
  roomCode: string;
  roomPhase: string;
}

interface CharactersState {
  characters: CharacterWithRoom[];
  loading: boolean;
  error: string | null;
}

export default function CharactersPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [state, setState] = useState<CharactersState>({
    characters: [],
    loading: true,
    error: null,
  });
  const [selectedContext, setSelectedContext] = useState<{ player: Player; roomId: string } | null>(null);

  const sortedCharacters = useMemo(
    () => [...state.characters].sort((a, b) => (a.character?.name || '').localeCompare(b.character?.name || '')),
    [state.characters]
  );

  const errorMessage = t('characters.messages.error');

  const fetchCharacters = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const memberships = await listRooms();
      const characters: CharacterWithRoom[] = [];

      for (const membership of memberships) {
        if (membership.player && membership.room) {
          characters.push({
            character: membership.player.character,
            player: membership.player,
            roomId: membership.room.id,
            roomCode: membership.room.code,
            roomPhase: membership.room.phase,
          });
        }
      }
      const validCharacters = characters.filter((c) => c.character !== null && c.character !== undefined);
      setState({ characters: validCharacters, loading: false, error: null });
    } catch (error) {
      setState({
        characters: [],
        loading: false,
        error: error instanceof Error ? error.message : errorMessage,
      });
    }
  }, [errorMessage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCharacters().catch((err: unknown) => {
      console.error('Failed to fetch characters:', err);
    });
  }, [fetchCharacters]);

  return (
    <PrivateLayout showNavbar>
      <div className="mx-auto flex min-h-dvh w-full flex-col gap-10 px-6 py-12 sm:px-10 lg:px-16 xl:max-w-6xl">
        <header className="flex flex-col gap-4 text-center sm:gap-6">
          <h1 className="font-display text-4xl uppercase tracking-[0.32em] text-aurora-200 sm:text-5xl">
            {t('characters.title')}
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-shadow-100/90 sm:text-lg">
            {t('characters.subtitle')}
          </p>
        </header>

        {state.loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-aurora-200 border-t-transparent" />
          </div>
        ) : state.error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-red-300">{state.error}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                fetchCharacters().catch(() => {});
              }}
            >
              {t('characters.actions.retry')}
            </Button>
          </div>
        ) : sortedCharacters.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-semibold text-shadow-50">{t('characters.empty.title')}</h2>
            <p className="max-w-xl text-sm text-shadow-300">{t('characters.empty.description')}</p>
            <div className="flex gap-3">
              <Button type="button" variant="default" onClick={() => navigate('/')}>
                {t('characters.empty.joinGame')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/characters/demo')}>
                {t('characters.empty.tryDemo')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-shadow-300">
                {sortedCharacters.length}{' '}
                {sortedCharacters.length === 1 ? t('characters.stats.character') : t('characters.stats.characters')}
              </p>
              <Button type="button" variant="secondary" onClick={() => navigate('/characters/demo')}>
                {t('characters.actions.tryDemo')}
              </Button>
            </div>

            {sortedCharacters.map((item) => {
              const { character, player, roomId, roomCode, roomPhase } = item;
              const phaseKey = `rooms.phases.${roomPhase}`;
              const phaseLabel = t(phaseKey);

              // Safe accessors with defaults
              const getEntityName = (ent: unknown) => {
                if (!ent) return '';
                if (typeof ent === 'string') return ent;
                return (ent as { name?: string }).name || '';
              };

              const raceName = getEntityName(character?.race) || 'Unknown Race';
              const className = getEntityName(character?.characterClass) || 'Unknown Class';
              const portraitUrl = character?.portrait?.url;

              return (
                <article
                  key={player.id}
                  className="rounded-3xl border border-aurora-400/20 bg-midnight-900/60 p-6 shadow-[0_28px_58px_rgba(7,5,10,0.5)] backdrop-blur"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      {portraitUrl ? (
                        <img
                          src={portraitUrl}
                          alt={`${character?.name} portrait`}
                          className="h-24 w-24 flex-shrink-0 rounded-xl border border-aurora-400/40 object-cover shadow-lg"
                        />
                      ) : (
                        <div className="h-24 w-24 flex-shrink-0 rounded-xl border border-midnight-600 bg-midnight-700/70 flex items-center justify-center">
                          <span className="text-3xl text-shadow-500">👤</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold text-shadow-50">{character?.name}</h3>
                          <p className="text-base text-shadow-300">
                            {raceName} • {className}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <span className="rounded-full border border-aurora-400/50 bg-aurora-500/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-aurora-100">
                            ID: {character?.documentId?.slice(0, 8)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-shadow-500">
                          <span className="uppercase tracking-wider">{t('characters.labels.room')}</span>
                          <span className="font-mono tracking-wider text-aurora-200">{roomCode}</span>
                          <span>•</span>
                          <span>{phaseLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedContext({ player, roomId })}
                        className="sm:min-w-[160px]"
                      >
                        {t('characters.actions.viewSheet')}
                      </Button>
                      <Button type="button" variant="default" onClick={() => navigate(`/room/${roomId}`)}>
                        {t('characters.actions.goToRoom')}
                      </Button>
                    </div>
                  </div>

                  {!!character?.backstory && (
                    <div className="mt-4 rounded-2xl border border-shadow-700 bg-shadow-900/60 p-4">
                      <p className="text-xs uppercase tracking-wider text-shadow-500 mb-2">
                        {t('characters.labels.backstory')}
                      </p>
                      {}
                      <p className="text-sm leading-relaxed text-shadow-200 line-clamp-3">{character.backstory}</p>
                    </div>
                  )}
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
    </PrivateLayout>
  );
}
