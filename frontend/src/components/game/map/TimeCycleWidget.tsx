import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

interface TimeCycleWidgetProps {
  time: number; // Total hours (or turns representing hours)
  className?: string;
}

export function TimeCycleWidget({ time, className }: TimeCycleWidgetProps) {
  // Cycle logic: 0-24 hours.
  // Dawn: 6, Dusk: 18.
  // 6-18: Day (Sun visible) -> 0 to 180 degrees.
  // 18-6: Night (Moon visible) -> 0 to 180 degrees (but Moon styling).

  // Normalize time to 0-24 cycle
  const cycleTime = time % 24;
  const isDay = cycleTime >= 6 && cycleTime < 18;

  // Calculate progress within the current phase (Day or Night)
  // Day: 6 -> 0%, 12 -> 50%, 18 -> 100%
  // Night: 18 -> 0%, 24/0 -> 50%, 6 -> 100%

  let progress = 0; // 0.0 to 1.0 representing position on arc (Left to Right)

  if (isDay) {
    progress = (cycleTime - 6) / 12;
  } else if (cycleTime >= 18) {
    progress = (cycleTime - 18) / 12;
  } else {
    progress = (cycleTime + 6) / 12;
  }

  // Clamp
  progress = Math.max(0, Math.min(1, progress));

  // Calculate position on semi-circle
  // 0% -> 180 deg (Left)
  // 50% -> 90 deg (Top)
  // 100% -> 0 deg (Right)
  // Actually SVG coordinate system:
  // Center (50, 50). Radius 40.
  // Angle in radians: PI (180) to 0.

  const angleRad = Math.PI * (1 - progress);
  const radius = 42;
  const cx = 50;
  const cy = 50; // semi-circle usually sits at bottom? User asked for semi-circle.
  // Let's make it an arch at the TOP. Horizon is bottom.

  const sunX = cx + radius * -Math.cos(angleRad); // -cos because 0 is right, PI is left.
  const sunY = cy + radius * -Math.sin(angleRad); // -sin because Y is down in SVG.

  // Decorative Styles
  const glowColor = isDay ? 'rgba(251, 191, 36, 0.6)' : 'rgba(167, 139, 250, 0.4)';
  const trackColor = isDay ? 'stroke-aurora-500/20' : 'stroke-nebula-500/20';

  return (
    <div className={cn('relative w-32 h-16 pointer-events-none select-none', className)}>
      {/* SVG Container */}
      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="dayTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.1)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.4)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.1)" />
          </linearGradient>
          <linearGradient id="nightTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          className={cn('stroke-[3px] stroke-linecap-round', trackColor)}
        />

        {/* Moving Celestial Body */}
        <g
          style={{
            transform: `translate(${sunX}px, ${sunY}px)`,
            transition: 'transform 1s linear', // Smooth movement
          }}
        >
          {/* Glow behind */}
          <circle r="8" fill={glowColor} filter="url(#glow)" className="opacity-70" />

          {/* Icon container */}
          <foreignObject x="-8" y="-8" width="16" height="16">
            <div className="flex items-center justify-center w-full h-full text-white">
              {isDay ? (
                <Sun className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse-slow" />
              ) : (
                <Moon className="w-4 h-4 text-violet-300 fill-violet-300" />
              )}
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* Text Overlay (Bottom Center) */}
      <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center justify-end translate-y-1/2">
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border backdrop-blur-sm',
            isDay
              ? 'text-amber-200 border-amber-500/30 bg-amber-950/50'
              : 'text-violet-200 border-violet-500/30 bg-midnight-950/50'
          )}
        >
          {Math.floor(cycleTime).toString().padStart(2, '0')}:00
        </span>
      </div>
    </div>
  );
}
