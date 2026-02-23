import { describe, it, expect } from 'vitest';
import { SpellMapper } from '@/features/genesis-core/mappers/spell-mapper';
import { SourceSpell } from '@/features/genesis-core/source-types';

describe('SpellMapper', () => {
    const mapper = new SpellMapper();
    const mockSpell: SourceSpell = {
        index: 'fireball',
        name: 'Fireball',
        desc: ['A bright streak flashes from your pointing finger...'],
        higher_level: ['When you cast this spell using a spell slot of 4th level or higher...'],
        range: '150 feet',
        components: ['V', 'S', 'M'],
        material: 'A tiny ball of bat guano and sulfur.',
        ritual: false,
        duration: 'Instantaneous',
        concentration: false,
        casting_time: '1 action',
        level: 3,
        school: { index: 'evocation', name: 'Evocation', url: '' },
        classes: [],
        url: ''
    };

    it('should map source spell to generation request', () => {
        const request = mapper.map(mockSpell);
        
        expect(request.uid).toBe('api::spell.spell');
        expect(request.referenceId).toBe('fireball');
        expect(request.name).toBe('Fireball');
        expect(request.prompt).toContain('Fireball');
        expect(request.prompt).toContain('evocation');
        expect(request.prompt).toContain('150 feet');
    });
});
