/* eslint-disable */
import { createGenesisEngine } from './factory';

console.log("Starting debug...");
try {
    const engine = createGenesisEngine();
    console.log("Engine created successfully.");
    console.log("Loader path:", engine.loader['schemaDir']); // Access private if possible or toString
} catch (e: any) {
    console.error("Failed to create engine:", e);
}
