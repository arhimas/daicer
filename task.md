
# Task: Ingest SRD Classes and Spells

## Research & Preparation
- [x] Analyze Compilation Specs (`01_spell_compilation.md`, `06_class_compilation.md`)
- [x] Inspect existing `data/library` structure
- [ ] Create `data/library/raw/srd_input.md` with provided text <!-- id: 0 -->
+ [x] Verify `SRD.md` content <!-- id: 0 -->

## Implementation (Parser)
- [ ] Create `scripts/genesis/srd-parser` directory <!-- id: 1 -->
- [ ] Implement `MarkdownSplitter` to separate Classes <!-- id: 2 -->
- [ ] Implement `ClassParser` to extract: <!-- id: 3 -->
    - [ ] Hit Die & Proficiencies
    - [ ] Progression Table (Level, PB, Features, Slots)
    - [ ] Subclasses (Domains, Circles, Archetypes)
- [ ] Implement `FeatureExtractor` to atomize features <!-- id: 4 -->
- [ ] Create `ingest-srd.ts` script to orchestrate parsing <!-- id: 5 -->

## Execution & Verification
- [x] Run `ingest-srd.ts` on `SRD.md` <!-- id: 6 -->
- [x] Verify generated JSONs in `data/library/molecules/classes` <!-- id: 7 -->
- [x] Verify extracted features in `data/library/atoms/features` <!-- id: 7b -->
- [x] Run `dry-run` validation if possible <!-- id: 8 -->

## Genesis Integration & Polishing
- [x] Analyze `EntitySheet.ts` for strict Atom/Molecule schemas <!-- id: 9 -->
- [x] Analyze `polish-library.ts` and `batch-polish.ts` <!-- id: 10 -->
- [x] Refactor `srd-parser` to output strict Atoms/Molecules <!-- id: 11 -->
- [x] Implement/Update `ingest-srd.ts` to trigger Polishing <!-- id: 12 -->
- [x] Create `scripts/genesis/reboot.ts` (Truncate + Ingest + Polish) <!-- id: 13 -->
- [x] Verify End-to-End "Fresh Start" <!-- id: 14 -->

## Spell Ingestion
- [x] Create `SpellParser.ts` <!-- id: 15 -->
- [x] Update `srd-parser/index.ts` to include Spells <!-- id: 16 -->
- [x] Update `reboot.ts` to wipe Spells <!-- id: 17 -->
- [x] Verify Spell Ingestion <!-- id: 18 -->

## Item Ingestion
- [x] Create `ItemParser.ts` <!-- id: 19 -->
- [x] Update `srd-parser/index.ts` to include Items <!-- id: 20 -->
- [x] Update `reboot.ts` <!-- id: 21 -->
- [x] Verify Item Ingestion <!-- id: 22 -->

## DB Population (Fresh Start)
- [x] Create/Audit Loaders <!-- id: 23 -->
- [x] Create `feature-loader.ts` <!-- id: 24 -->
- [x] Update `reboot.ts` to run loaders <!-- id: 25 -->
- [x] Nuke Database (Schema Reset) <!-- id: 26 -->
- [x] Fix Plugin Dependencies (`sqlite-vec`) <!-- id: 27 -->
- [x] Verify End-to-End Reboot <!-- id: 28 -->
