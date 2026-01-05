import type { ReactNode } from 'react';
import type { Room, Player } from '@/types/contracts';
import { gildedTokens } from '@/theme/gildedTokens';
import { BackgroundDiceField } from '../ui/background/BackgroundDiceField';
import DynamicLayout from './DynamicLayout';

interface JuicyLayoutProps {
  children: ReactNode;
  room?: Room | null;
  players?: Player[];
  playerCount?: number;
  showRoomInfo?: boolean;
  showNavbar?: boolean;
  className?: string;
  mainClassName?: string;
}

/**
 * JuicyLayout - The "Mandatory" rich visual layout.
 * Enforces the falling dice background and gilded dark theme structure.
 */
export default function JuicyLayout({
  children,
  room = null,
  players = [],
  playerCount = 0,
  showRoomInfo = false,
  showNavbar = true,
  className,
  mainClassName,
}: JuicyLayoutProps) {
  return (
    <DynamicLayout
      room={room}
      players={players}
      playerCount={playerCount}
      showRoomInfo={showRoomInfo}
      showNavbar={showNavbar}
      className={className}
      mainClassName={mainClassName}
    >
      <BackgroundDiceField />

      <div className={gildedTokens.pageShell}>
        <div className={gildedTokens.gradientBackdrop} />

        {/* Content wrapper ensuring z-index is above background */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </DynamicLayout>
  );
}
