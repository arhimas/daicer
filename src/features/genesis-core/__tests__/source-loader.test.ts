import { describe, it, expect } from 'vitest';
import { SourceLoader } from '@/features/genesis-core/source-loader';

describe('SourceLoader', () => {
    const loader = new SourceLoader();

    it('should load spells', async () => {
        const spells = await loader.loadSpells();
        expect(spells.length).toBeGreaterThan(0);
        const acidArrow = spells.find(s => s.index === 'acid-arrow');
        expect(acidArrow).toBeDefined();
        expect(acidArrow?.name).toBe('Acid Arrow');
    });

    it('should load races', async () => {
        const races = await loader.loadRaces();
        expect(races.length).toBeGreaterThan(0);
        const dwarf = races.find(r => r.index === 'dwarf');
        expect(dwarf).toBeDefined();
        expect(dwarf?.speed).toBe(25);
    });

    it('should load classes', async () => {
        const classes = await loader.loadClasses();
        expect(classes.length).toBeGreaterThan(0);
        const wizard = classes.find(c => c.index === 'wizard');
        expect(wizard).toBeDefined();
        expect(wizard?.hit_die).toBe(6);
    });

    it('should load equipment items', async () => {
        const items = await loader.loadItems();
        expect(items.length).toBeGreaterThan(0);
        const dagger = items.find(i => i.index === 'dagger');
        expect(dagger).toBeDefined();
        expect(dagger?.cost.quantity).toBe(2);
    });
});
