import { Box, Typography } from '@strapi/design-system';
import { Play } from '@strapi/icons';

interface ScrubberProps {
  min: number;
  max: number;
  current: number;
  onChange: (val: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const Scrubber = ({ 
  min, 
  max, 
  current, 
  onChange, 
  isPlaying, 
  onPlayPause 
}: ScrubberProps) => {
  return (
    <Box padding={4} background="neutral100" hasRadius shadow="filterShadow">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onPlayPause}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isPlaying ? <Typography variant="pi" fontWeight="bold">||</Typography> : <Play />}
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <input
            type="range"
            min={min}
            max={max}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
            <span>Start</span>
            <span>{current} / {max}</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    </Box>
  );
};
