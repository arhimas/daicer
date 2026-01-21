import seedrandom from 'seedrandom';

export interface WorldCondition {
  type: 'World Condition';
  key: string;
  values: string[];
  currentValue: string;
  description: string;
  lastUpdatedTurn: number;
  ordered?: boolean;
}

export interface RandomEvent {
  type: 'Random Event';
  name: string;
  description: string;
  impact: string;
  turnTriggered: number;
  visibility: 'dm' | 'public';
}

export interface EntropyState {
  conditions: WorldCondition[];
  eventsLog: RandomEvent[];
  entropyPool: number; // 0.0 to 1.0 (or higher)
}

export interface EntropyChange {
  mutation?: {
    key: string;
    newValue: string;
    reason: string;
  };
  newEvent?: RandomEvent;
}

// --- DATA POOL (Ported from POC) ---

const WORLD_CONDITIONS_POOL: Omit<WorldCondition, 'lastUpdatedTurn' | 'currentValue' | 'type'>[] = [
  {
    key: 'Aetheric Tides',
    values: ['Ebb', 'Flow', 'Neap', 'King'],
    description: 'The invisible flow of magical energy in the region. Affects spellcasting potency and stability.',
    ordered: true,
  },
  {
    key: 'Planar Alignment',
    values: ['Stable', 'Whispering', 'Intruding', 'Overlapping'],
    description:
      'The proximity of other planes of existence to the material world, potentially causing strange phenomena.',
    ordered: true,
  },
  {
    key: 'Political Climate',
    values: ['Peaceful', 'Tense', 'Skirmishes', 'Open War'],
    description: 'The state of relations between the major factions or kingdoms.',
    ordered: true,
  },
  {
    key: 'Divine Favor',
    values: ['Favored', 'Neutral', 'Ignored', 'Forsaken'],
    description: 'The perceived disposition of the gods towards the mortals of the land.',
    ordered: false,
  },
  {
    key: 'Sky Sentinel',
    values: ['Clear Skies', 'Twin Moons', 'Raining Stars', 'Ominous Comet'],
    description: 'A significant celestial body or event visible in the sky, often interpreted as an omen.',
    ordered: false,
  },
  {
    key: 'Wilderness Aggression',
    values: ['Docile', 'Wary', 'Hostile', 'Frenzied'],
    description: 'The general behavior of wild beasts and monsters in the region.',
    ordered: true,
  },
  {
    key: 'Trade & Commerce',
    values: ['Booming', 'Stagnant', 'Recession', 'Embargoed'],
    description: 'The flow of goods and wealth within the local area.',
    ordered: true,
  },
  {
    key: 'Local Weather',
    values: ['Clear', 'Overcast', 'Rain', 'Storm', 'Fog', 'Snow'],
    description: 'The current weather conditions in the immediate area.',
    ordered: false,
  },
];

const RANDOM_EVENTS_POOL: Omit<RandomEvent, 'turnTriggered' | 'type' | 'visibility'>[] = [
  {
    name: 'Ghostly Procession',
    description:
      'A silent, translucent caravan of figures from a bygone era is seen travelling an old road at midnight.',
    impact: 'Locals are spooked. May reveal a forgotten location or a quest hook related to the past.',
  },
  {
    name: 'Sudden Blight',
    description:
      'A small, localized area of plant life suddenly withers and dies, turning black as if touched by necrotic energy.',
    impact: "A vital crop may be threatened, or it could be the sign of a monster's nearby lair.",
  },
  {
    name: "Merchant's Misfortune",
    description:
      'A well-known travelling merchant has their wagon wheel break on the main road, spilling their exotic goods.',
    impact: 'An opportunity for trade, a potential ambush target, or a chance to earn a reward for helping.',
  },
  {
    name: 'Prophetic Dream',
    description:
      'One of the party members receives a vivid, cryptic dream from an unknown entity, showing a glimpse of a possible future.',
    impact: 'Provides a clue, a warning, or a red herring for the party to interpret.',
  },
  {
    name: 'Wild Magic Surge',
    description:
      'For a brief period, all spells cast in the area have a small chance of triggering an additional, unforeseen effect.',
    impact: 'Spellcasting becomes unpredictable and potentially dangerous or hilarious for a short time.',
  },
];

/**
 * The Entropy System manages "World CHAOS" and "narrative variance".
 * It tracks global conditions (Weather, Politics) and introduces random events
 * based on an accumulating "Entropy Pool".
 * 
 * As turns pass without incident, Entropy rises, making an event more likely.
 * When an event occurs, Entropy falls.
 */
export class EntropySystem {
  private _rng: seedrandom.PRNG;
  private _state: EntropyState;
  private _seed: string;

  constructor(seed: string, initialState?: EntropyState) {
    this._seed = seed;
    this._rng = seedrandom(seed);

    if (initialState) {
      this._state = initialState;
    } else {
      this._state = this._generateInitialState();
    }
  }

  public get state(): EntropyState {
    return this._state;
  }

  private _generateInitialState(): EntropyState {
    // Shuffle and pick 5 conditions
    const selected = [...WORLD_CONDITIONS_POOL].sort(() => this._rng() - 0.5).slice(0, 5);

    const conditions: WorldCondition[] = selected.map((c) => ({
      ...c,
      type: 'World Condition',
      currentValue: c.values[Math.floor(this._rng() * c.values.length)],
      lastUpdatedTurn: 0,
    }));

    return {
      conditions,
      eventsLog: [],
      entropyPool: 0.1, // Start low
    };
  }

  /**
   * Advance entropy by N turns.
   * This is the primary driver for entropy changes.
   */
  public advanceTurn(turnCount: number, currentTurn: number): EntropyChange | null {
    // Base probability scales with entropy pool and turns passed
    const probability = 0.1 + this._state.entropyPool * 0.5;

    // Simulating the check
    const roll = this._rng();

    // Increase entropy slightly just for time passing
    this._state.entropyPool = Math.min(1.0, this._state.entropyPool + 0.01 * turnCount);

    if (roll > probability) {
      return null; // No change
    }

    // Change occurred!
    // Reset entropy pool slightly to represent release of tension
    this._state.entropyPool = Math.max(0.0, this._state.entropyPool - 0.2);

    const changeTypeRoll = this._rng();
    if (changeTypeRoll < 0.75) {
      // MUTATION
      const condition = this._state.conditions[Math.floor(this._rng() * this._state.conditions.length)];
      const possibleValues = condition.values.filter((v) => v !== condition.currentValue);

      if (possibleValues.length === 0) return null;

      const newValue = possibleValues[Math.floor(this._rng() * possibleValues.length)];

      // Update state
      condition.currentValue = newValue;
      condition.lastUpdatedTurn = currentTurn;

      return {
        mutation: {
          key: condition.key,
          newValue,
          reason: 'The winds of fate have shifted.',
        },
      };
    } else {
      // NEW EVENT
      const eventTemplate = RANDOM_EVENTS_POOL[Math.floor(this._rng() * RANDOM_EVENTS_POOL.length)];
      const newEvent: RandomEvent = {
        ...eventTemplate,
        type: 'Random Event',
        turnTriggered: currentTurn,
        visibility: 'dm', // Default to DM only as requested
      };

      this._state.eventsLog.unshift(newEvent);
      // Keep log size managed
      if (this._state.eventsLog.length > 20) {
        this._state.eventsLog.pop();
      }

      return {
        newEvent,
      };
    }
  }

  /**
   * Simulate bulk time passage (e.g. 8 hours rest).
   * Instead of thousands of checks, we do one high-weight check.
   */
  public simulateTimePassage(hours: number, currentTurn: number): EntropyChange | null {
    // Heavy weight for long durations
    const probability = hours >= 8 ? 0.8 : hours * 0.1;

    if (this._rng() > probability) {
      // Just increase pool
      this._state.entropyPool = Math.min(1.0, this._state.entropyPool + 0.05 * hours);
      return null;
    }

    // Trigger a change
    return this.advanceTurn(1, currentTurn);
  }

  /**
   * Apply a change to the state (used for Replay or applying generated changes).
   */
  public applyChange(change: EntropyChange, currentTurn: number) {
    if (change.mutation) {
      const { key, newValue } = change.mutation;
      const condition = this._state.conditions.find((c) => c.key === key);
      if (condition) {
        condition.currentValue = newValue;
        condition.lastUpdatedTurn = currentTurn;
      }
    }
    if (change.newEvent) {
      this._state.eventsLog.unshift(change.newEvent);
      if (this._state.eventsLog.length > 20) {
        this._state.eventsLog.pop();
      }
    }
  }
}
