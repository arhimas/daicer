import { Entity } from '../../types';
import { DamageType } from './DamageType';

/**
 * Represents a discrete packet of damage.
 * Knows how to resolve itself against a target's resistances/immunities.
 */
export class DamageInstance {
  constructor(
    public readonly amount: number,
    public readonly type: DamageType,
    public readonly source?: string, // description of source, e.g. "Longsword"
    public readonly isMagic: boolean = false
  ) {}

  /**
   * Pure resolution against a target's defenses.
   * Returns the final damage number to subtract from HP.
   */
  public resolveAgainst(target: Entity): { finalAmount: number; logic: string[] } {
    const logic: string[] = [];
    let current = this.amount;

    // 1. Immunity
    const isImmune = target.immunities?.some((i) => i.toLowerCase() === this.type.toLowerCase());
    if (isImmune) {
      logic.push(`Immune to ${this.type}`);
      return { finalAmount: 0, logic };
    }

    // 2. Vulnerability (Applied before or after resistance? 5e says: Vuln -> then Resist? Actually 5e PHB: Resist first, then Vuln.)
    // Wait, PHB pg 197: "Resistance and then vulnerability are applied after all other modifiers to damage."
    // Order: (Damage) -> Resistance -> Vulnerability.

    // Resistance
    const isResistant = target.resistances?.some((r) => r.toLowerCase() === this.type.toLowerCase());
    if (isResistant) {
      current = Math.floor(current / 2);
      logic.push(`Resistant to ${this.type} (Halved)`);
    }

    // Vulnerability
    const isVulnerable = target.vulnerabilities?.some((v) => v.toLowerCase() === this.type.toLowerCase());
    if (isVulnerable) {
      current = Math.floor(current * 2);
      logic.push(`Vulnerable to ${this.type} (Doubled)`);
    }

    return { finalAmount: current, logic };
  }
}
