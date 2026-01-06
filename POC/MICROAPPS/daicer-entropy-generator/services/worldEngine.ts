
import type { WorldCondition, TurnUpdate, RandomEvent } from '../types';

// --- DATABASE OF PREDEFINED CONTENT ---

type ConditionTemplate = Omit<WorldCondition, 'lastUpdatedTurn' | 'currentValue' | 'type'>;
type EventTemplate = Omit<RandomEvent, 'turnTriggered' | 'type'>;

const worldConditionsPool: ConditionTemplate[] = [
    {
        key: "Aetheric Tides",
        values: ["Ebb", "Flow", "Neap", "King"],
        description: "The invisible flow of magical energy in the region. Affects spellcasting potency and stability.",
        ordered: true,
    },
    {
        key: "Planar Alignment",
        values: ["Stable", "Whispering", "Intruding", "Overlapping"],
        description: "The proximity of other planes of existence to the material world, potentially causing strange phenomena.",
        ordered: true,
    },
    {
        key: "Political Climate",
        values: ["Peaceful", "Tense", "Skirmishes", "Open War"],
        description: "The state of relations between the major factions or kingdoms.",
        ordered: true,
    },
    {
        key: "Divine Favor",
        values: ["Favored", "Neutral", "Ignored", "Forsaken"],
        description: "The perceived disposition of the gods towards the mortals of the land.",
        ordered: false,
    },
    {
        key: "Sky Sentinel",
        values: ["Clear Skies", "Twin Moons", "Raining Stars", "Ominous Comet"],
        description: "A significant celestial body or event visible in the sky, often interpreted as an omen.",
        ordered: false,
    },
    {
        key: "Wilderness Aggression",
        values: ["Docile", "Wary", "Hostile", "Frenzied"],
        description: "The general behavior of wild beasts and monsters in the region.",
        ordered: true,
    },
    {
        key: "Trade & Commerce",
        values: ["Booming", "Stagnant", "Recession", "Embargoed"],
        description: "The flow of goods and wealth within the local area.",
        ordered: true,
    }
];

const randomEventsPool: EventTemplate[] = [
    {
        name: "Ghostly Procession",
        description: "A silent, translucent caravan of figures from a bygone era is seen travelling an old road at midnight.",
        impact: "Locals are spooked. May reveal a forgotten location or a quest hook related to the past."
    },
    {
        name: "Sudden Blight",
        description: "A small, localized area of plant life suddenly withers and dies, turning black as if touched by necrotic energy.",
        impact: "A vital crop may be threatened, or it could be the sign of a monster's nearby lair."
    },
    {
        name: "Merchant's Misfortune",
        description: "A well-known travelling merchant has their wagon wheel break on the main road, spilling their exotic goods.",
        impact: "An opportunity for trade, a potential ambush target, or a chance to earn a reward for helping."
    },
    {
        name: "Prophetic Dream",
        description: "One of the party members receives a vivid, cryptic dream from an unknown entity, showing a glimpse of a possible future.",
        impact: "Provides a clue, a warning, or a red herring for the party to interpret."
    },
    {
        name: "Wild Magic Surge",
        description: "For a brief period, all spells cast in the area have a small chance of triggering an additional, unforeseen effect.",
        impact: "Spellcasting becomes unpredictable and potentially dangerous or hilarious for a short time."
    }
];

// --- ENGINE LOGIC ---

// Helper to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function generateInitialConditions(): Omit<WorldCondition, 'lastUpdatedTurn'>[] {
    const selectedConditions = shuffle([...worldConditionsPool]).slice(0, 5);
    
    return selectedConditions.map(condition => ({
        ...condition,
        type: 'World Condition',
        currentValue: condition.values[Math.floor(Math.random() * condition.values.length)],
    }));
}

const durationProbabilities: { [key: string]: number } = {
    '1 Hour': 0.05,  // 5% chance of change
    '8 Hours': 0.20, // 20%
    '1 Day': 0.40,  // 40%
    '1 Week': 0.80, // 80%
};

export function advanceTurn(currentConditions: WorldCondition[], duration: string): TurnUpdate {
    const probability = durationProbabilities[duration] || 0.1;

    // Roll to see IF a change occurs
    if (Math.random() > probability) {
        return {}; // No change
    }

    // A change occurred! Decide WHAT kind of change
    // 75% chance of mutation, 25% chance of new event
    const changeTypeRoll = Math.random();

    if (changeTypeRoll < 0.75) {
        // --- MUTATION ---
        const conditionToMutate = currentConditions[Math.floor(Math.random() * currentConditions.length)];
        const possibleNewValues = conditionToMutate.values.filter(v => v !== conditionToMutate.currentValue);
        
        if(possibleNewValues.length === 0) return {}; // Failsafe if only one value exists

        const newValue = possibleNewValues[Math.floor(Math.random() * possibleNewValues.length)];

        return {
            mutation: {
                key: conditionToMutate.key,
                newValue: newValue,
                reason: "The winds of fate have shifted."
            }
        };

    } else {
        // --- NEW EVENT ---
        const newEvent = randomEventsPool[Math.floor(Math.random() * randomEventsPool.length)];
        return {
            newEvent: newEvent
        };
    }
}
