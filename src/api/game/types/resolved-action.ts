export interface ResolvedAction {
  documentId: string;
  name: string;
  type: string;
  attack?: { bonus: number };
  effects?: Array<{ type: string; dice?: string; subtype?: string }>;
  save?: { attribute: string; dc: number };
  range?: { value: number };
  cost?: string;
  description?: string;
  action_definition?: Record<string, unknown>;
}
