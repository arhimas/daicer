# Compilation Molecules

Compilers for logic units:

- **SpellCompiler**: Validates `spell`. Includes a strict **Hydration Dry Run** using `ActionHydrator` to ensure parsing of dice formulas and range configs works before the game starts.
- **FeatureCompiler**: Validates `feature` (Class features, Feats).
