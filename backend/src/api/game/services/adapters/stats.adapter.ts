import { StatBlock } from '../../../../engine/types';
import { StrapiComponentStats, StrapiEntitySheet } from './types';

export const mapStrapiStatsToStatBlock = (
  primary: StrapiComponentStats | undefined,
  fallback: StrapiComponentStats | undefined = {}
): StatBlock => {
  const getStat = (key: keyof StrapiComponentStats): number => {
    const val = primary?.[key] ?? fallback?.[key];
    return typeof val === 'number' ? val : 10;
  };

  const strength = getStat('strength');
  const dexterity = getStat('dexterity');
  const constitution = getStat('constitution');
  const intelligence = getStat('intelligence');
  const wisdom = getStat('wisdom');
  const charisma = getStat('charisma');

  const initiativeBonus = Math.floor((dexterity - 10) / 2);
  const passivePerception =
    primary?.passivePerception ?? fallback?.passivePerception ?? 10 + Math.floor((wisdom - 10) / 2);

  return {
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    passivePerception,
    initiativeBonus,
  };
};

export const resolveBaseStats = (sheet: StrapiEntitySheet): StatBlock => {
  // 1. Extract sources (Sheet overrides Blueprint)
  const s = sheet.stats;
  const b = sheet.character?.stats || sheet.monster?.stats;
  return mapStrapiStatsToStatBlock(s, b);
};
