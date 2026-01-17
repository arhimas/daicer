# 04. Trait Compilation Specification

## 1. Objective
To verify that a `Trait` (Racial or Monster) is correctly registered and operative.

## 2. Static Validation
- **Core Fields**: `slug`, `name`, `type` (racial/monster).
- **Registry Check**: Similar to Features, Traits often map to mechanical handlers in `FeatureRegistry` or specific modifier dictionaries.

## 3. Logic Validation (Modifier/Capability Check)
**Engine Path**: `src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts` (Features & Traits often share this).

1.  **Lookup**: Query registry for trait slug.
2.  **Fallback Check**: If not in Registry, check if it maps to a known passive modifier (e.g., "Darkvision").
    - **Vision**: Does it map to `VisionCapabilities`?
    - **Resistances**: Does it map to `DamageResistances` (e.g., "Dwarven Resilience" -> Poison Resistance).

## 4. Simulation
1.  **Mock Context**: `DerivationContext`.
2.  **Trigger**:
    - If passive (e.g. Resistance), invoke `ActionDispatcher` with a damage type that should be resisted.
    - **Assertion**: Verify damage is halved or immune message appears in logs.

## 5. Success Criteria
1.  Trait is either a registered `FeatureHandler` OR a known Passive Modifier key.
2.  Simulation proves the modifier takes effect (e.g. Darkvision flag is set, Damage is resisted).
