
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
}

export type EntropyItem = WorldCondition | RandomEvent;

export interface TurnUpdate {
    mutation?: {
      key: string;
      newValue: string;
      reason: string;
    };
    newEvent?: {
      name: string;
      description: string;
      impact: string;
    };
}
