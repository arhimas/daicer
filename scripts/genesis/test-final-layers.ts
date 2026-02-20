import { SourceLoader } from '../../src/features/genesis-core/source-loader';

async function testLoader() {
    const loader = new SourceLoader();
    try {
        const classes = await loader.loadClasses();
        console.log(`Loaded ${classes.length} classes.`);
        const races = await loader.loadRaces();
        console.log(`Loaded ${races.length} races.`);
        const monsters = await loader.loadMonsters();
        console.log(`Loaded ${monsters.length} monsters.`);
    } catch (e) {
        console.error('Error loading composite sources:', e);
    }
}
testLoader();
