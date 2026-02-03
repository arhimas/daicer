import { describe, it, expect } from 'vitest';
import { chunkMarkdown } from '@daicer/shared/utils/markdown-chunker';

describe('markdown-chunker (Adaptive SOTA)', () => {
  it('should keep H1 intact if it fits in token limit', async () => {
    // "Content" is tiny, fits easily.
    // H3s should be aggregated.
    const markdown = `
# Race
## Elf
### Darkvision
### Keen Senses
## Dwarf
### Resilience
    `;

    // Total size is small. Logic:
    // H1 (Race) fits? Yes. -> 1 chunk.

    const chunks = await chunkMarkdown(markdown);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].title).toBe('Race');
    expect(chunks[0].content).toContain('## Elf');
    expect(chunks[0].content).toContain('## Dwarf');
    expect(chunks[0].path).toEqual(['Race']);
  });

  it('should split H1 if too big, but keep H2s intact', async () => {
    // We mock "Too Big" by relying on the 8000 default.
    // We need REAL content size. "word " * 6000 = 6000 tokens.
    // H1 total = 12000 tokens.
    // H2_1 = 6000 tokens (Fits).
    // H2_2 = 6000 tokens (Fits).

    const bigContent = 'word '.repeat(5000); // 5k tokens

    const markdown = `
# Engineering
## Backend
${bigContent}
## Frontend
${bigContent}
    `;

    // Root (Engineering) -> 10k+ tokens (Too Big).
    // Split to children:
    // 1. ## Backend (5k tokens) -> Fits! -> Chunk 1
    // 2. ## Frontend (5k tokens) -> Fits! -> Chunk 2

    const chunks = await chunkMarkdown(markdown);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe('Backend');
    expect(chunks[0].path).toEqual(['Engineering', 'Backend']);
    expect(chunks[0].content).toContain('## Backend');

    expect(chunks[1].title).toBe('Frontend');
    expect(chunks[1].path).toEqual(['Engineering', 'Frontend']);
    expect(chunks[1].content).toContain('## Frontend');
  });

  it('should split deep leaf nodes if they are individually too big', async () => {
    // A single leaf node that is 10k tokens > 8k tokens
    // Should fallback to TokenTextSplitter
    const hugeContent = 'word '.repeat(10000);
    const markdown = `
# Singleton
## Massive
${hugeContent}
     `;

    const chunks = await chunkMarkdown(markdown);
    expect(chunks.length).toBeGreaterThan(1); // Split occurred
    expect(chunks[0].title).toContain('Massive');
    expect(chunks[0].path).toEqual(['Singleton', 'Massive']);
  });
});
