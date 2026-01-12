import fs from 'fs';
import path from 'path';
import { EngineCommand } from '../../api/game/schemas/commands';
import { StateDiff } from '../../api/game/services/action-engine';

export interface RecordedScenarioStep {
  command: EngineCommand;
  output: {
    events: unknown[];
    stateDiff: StateDiff; // We can snapshot the diff
  };
}

export class GameplayRecorder {
  private steps: RecordedScenarioStep[] = [];
  private filePath: string;

  constructor(filename: string) {
    const dir = path.join(process.cwd(), 'scenarios');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.join(dir, filename);
  }

  recordStep(command: EngineCommand, result: { events: unknown[]; stateDiff: StateDiff }) {
    // Sanitize?
    // We might want to remove complex timestamps or randomize IDs if they are non-deterministic,
    // but for Golden Path we want Determinism.
    this.steps.push({
      command,
      output: result,
    });
  }

  async save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.steps, null, 2));
    console.log(`[GameplayRecorder] Scenario saved to ${this.filePath}`);
  }
}
