import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import type { Player, EntitySheet } from '@/types/contracts';
import { ExecuteToolDocument } from '../../gql/graphql';
import UniversalEntitySheet from './UniversalEntitySheet';

interface EntitySheetPanelProps {
  player: Player | null;
  roomId?: string;
  onClose: () => void;
}

export default function EntitySheetPanel({ player, roomId, onClose }: EntitySheetPanelProps) {
  const [executeTool] = useMutation(ExecuteToolDocument);

  if (!player?.character) return null;

  const entity = player.character as unknown as EntitySheet;

  const handleAction = async (actionId: string) => {
    if (!roomId) {
      toast.error('Cannot perform action: No Room Context');
      return;
    }

    try {
      const actorId = player.character?.documentId;
      if (!actorId) throw new Error('No Actor ID found');

      // Construct command
      const command = `perform_action(actorId="${actorId}", actionId="${actionId}")`;

      const result = await executeTool({
        variables: {
          roomId,
          command,
        },
      });

      if (result.data?.executeTool) {
        toast.success(`Action initiated: ${actionId}`);
      }
    } catch (err) {
      console.error('Action failed:', err);
      toast.error('Action execution failed');
    }
  };

  return <UniversalEntitySheet entity={entity} onClose={onClose} onAction={handleAction} />;
}
