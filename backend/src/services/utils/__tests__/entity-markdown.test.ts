import { describe, it, expect } from 'vitest';
import { entityToMarkdown } from '../entity-markdown';

describe('entityToMarkdown', () => {
  it('should generate a basic header and description', () => {
    const data = {
      description: 'A powerful fire spell.',
      level: 3,
    };
    const md = entityToMarkdown('spell', 'Fireball', data);
    expect(md).toContain('# Fireball');
    expect(md).toContain('**Type**: spell');
    expect(md).toContain('**Description**:\nA powerful fire spell.');
    expect(md).toContain('- **level**: 3');
  });

  it('should ignore system fields', () => {
    const data = {
      id: 1,
      documentId: 'doc123',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
      publishedAt: '2023-01-02',
      createdBy: 'admin',
      updatedBy: 'admin',
      embedding: [0.1, 0.2],
      name: 'Ignored Name', // redundant in body
      realField: 'Keep Me',
    };
    const md = entityToMarkdown('test', 'Test', data);
    expect(md).not.toContain('id');
    expect(md).not.toContain('documentId');
    expect(md).not.toContain('createdAt');
    expect(md).not.toContain('embedding');
    expect(md).toContain('- **realField**: Keep Me');
  });

  it('should format single relations using name or title', () => {
    const data = {
      school: { name: 'Evocation', id: 5 },
      origin: { title: 'Core Rulebook', id: 9 },
      complex: { noName: true, val: 1 },
    };
    const md = entityToMarkdown('spell', 'Spell', data);
    expect(md).toContain('- **school**: Evocation');
    expect(md).toContain('- **origin**: Core Rulebook');
    // Basic JSON fallback for unknown structure
    expect(md).toContain('- **complex**: {"noName":true,"val":1}');
  });

  it('should format array relations', () => {
    const data = {
      classes: [
        { name: 'Wizard', id: 1 },
        { name: 'Sorcerer', id: 2 },
      ],
      tags: ['Fire', 'Ranged'], // Primitive array
      emptyList: [],
    };
    const md = entityToMarkdown('spell', 'Spell', data);
    expect(md).toContain('- **classes**: Wizard, Sorcerer');
    expect(md).toContain('- **tags**: Fire, Ranged'); // Primitives
    expect(md).not.toContain('emptyList');
  });

  it('should handle nulls and undefined gracefully', () => {
    const data = {
      valid: 'Yes',
      missing: null,
      gone: undefined,
    };
    const md = entityToMarkdown('test', 'Test', data);
    expect(md).toContain('- **valid**: Yes');
    expect(md).not.toContain('missing');
    expect(md).not.toContain('gone');
  });

  it('should sort keys alphabetically for deterministic output', () => {
    const data = {
      zebra: 1,
      alpha: 2,
      beta: 3
    };
    const md = entityToMarkdown('test', 'Test', data);
    const alphaIndex = md.indexOf('alpha');
    const betaIndex = md.indexOf('beta');
    const zebraIndex = md.indexOf('zebra');
    
    expect(alphaIndex).toBeLessThan(betaIndex);
    expect(betaIndex).toBeLessThan(zebraIndex);
  });
});
