import type { Player, EntitySheet } from '@/types/contracts';
import UniversalEntitySheet from './UniversalEntitySheet';

interface EntitySheetPanelProps {
  player: Player | null;
  onClose: () => void;
}

export default function EntitySheetPanel({ player, onClose }: EntitySheetPanelProps) {
  if (!player?.character) return null;

  // Adapt Player data to EntitySheet if necessary,
  // but standardized schema says player.character IS EntitySheet compatible.
  // We use `as unknown as EntitySheet` if there are slight mismatches in compilation,
  // but Phase 1 should have aligned them.
  const entity = player.character as unknown as EntitySheet;

  return <UniversalEntitySheet entity={entity} onClose={onClose} />;
}
