# Mechanics: Features

Implementations of complex Game Rules (Code-Behind).
Instead of storing logic in the database, we store references (Slugs) in the DB, and map them here to executable `FeatureHandlers`.

## Examples

- **Sneak Attack**: Checks context (Ally adjacent? Disadvantage?) and adds extra damage dice.
- **Rage**: Checks state (Is Raging?) and adds flat damage bonuses.
