import { formatDmInstruction, DM_VERBOSITY_LEVELS } from '@daicer/engine/rules/narrator';
import { DMStyle } from '@daicer/engine/rules/types';

describe('Narrator Rules', () => {
  it('returns default string if no style provided', () => {
    expect(formatDmInstruction(null)).toBe('Standard DM Style');
    expect(formatDmInstruction(undefined)).toBe('Standard DM Style');
  });

  it('formats a full DM style object', () => {
    const style: DMStyle = {
      verbosity: 5, // Epic
      detail: 6, // Cinematic
      engagement: 1, // Facilitator
      narrative: 4, // Plotted
      specialMode: 'Noir Detective',
      customDirectives: 'Speak in riddles',
    };

    const result = formatDmInstruction(style);

    expect(result).toContain(`- Verbosity: ${DM_VERBOSITY_LEVELS[5]}`);
    expect(result).toContain('Cinematic');
    expect(result).toContain('Facilitator');
    expect(result).toContain('Plotted');
    expect(result).toContain('Performance Mode: Noir Detective');
    expect(result).toContain('Custom Directives: "Speak in riddles"');
  });

  it('gracefully handles missing optional fields', () => {
    const style: DMStyle = {
      verbosity: 0,
      detail: 0,
      engagement: 0,
      narrative: 0,
    };
    const result = formatDmInstruction(style);
    expect(result).not.toContain('Performance Mode');
    expect(result).not.toContain('Custom Directives');
  });
});
