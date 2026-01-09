import { StatBlock } from '../../../../engine/types';
import { StrapiComponentStats, StrapiEntitySheet } from './types';

export const resolveBaseStats = (sheet: StrapiEntitySheet): StatBlock => {
  // 1. Extract sources (Sheet overrides Blueprint)
  const s = sheet.stats || {};
  const b = sheet.character?.stats || sheet.monster?.stats || {};

  // 2. Helper With Default
  const getStat = (key: keyof StrapiComponentStats): number => {
    // If explicit 0, we take it? assume stats range 1-30.
    // s[key] ?? b[key] ?? 10
    const val = s[key] ?? b[key];
    return typeof val === 'number' ? val : 10;
  };

  const strength = getStat('strength');
  const dexterity = getStat('dexterity');
  const constitution = getStat('constitution');
  const intelligence = getStat('intelligence');
  const wisdom = getStat('wisdom');
  const charisma = getStat('charisma');

  // 3. Derived Values
  const initiativeBonus = Math.floor((dexterity - 10) / 2);
  const passivePerception = s.passivePerception ?? b.passivePerception ?? 10 + Math.floor((wisdom - 10) / 2);

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
