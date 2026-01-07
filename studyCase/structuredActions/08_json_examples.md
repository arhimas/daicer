# Structured Actions: JSON Examples

This document provides valid JSON examples conforming to the proposed schemas.

---

## 1. SPELLS (6 Examples)

### 1.1 Fireball (Evocation, AoE Save)

```json
{
  "name": "Fireball",
  "level": 3,
  "school": "Evocation",
  "casting_config": {
    "time_value": 1,
    "time_unit": "Action",
    "components": { "verbal": true, "somatic": true, "material": true, "material_desc": "Bat guano" }
  },
  "range_config": {
    "type": "Ranged (Feet)",
    "distance": 150,
    "aoe_shape": "Sphere",
    "aoe_size": 20
  },
  "duration_config": { "type": "Instantaneous" },
  "mechanics_config": { "action_type": "Dexterity Save", "save_effect": "Half" },
  "damage_instances": [
    { "effect_type": "Damage", "damage_type": "Fire", "dice_count": 8, "dice_value": 6, "timing": "Instant" }
  ],
  "scaling_config": { "scales": true, "type": "Dice", "dice_count": 1, "dice_value": 6 }
}
```

### 1.2 Mage Armor (Abjuration, Touch, Duration)

```json
{
  "name": "Mage Armor",
  "level": 1,
  "school": "Abjuration",
  "casting_config": {
    "time_value": 1,
    "time_unit": "Action",
    "components": { "verbal": true, "somatic": true, "material": true, "material_desc": "Cured leather" }
  },
  "range_config": { "type": "Touch" },
  "duration_config": { "type": "Time-Limited", "value": 8, "unit": "Hours" },
  "mechanics_config": { "action_type": "None" },
  "condition_instances": [{ "condition": "Special", "description": "AC becomes 13 + Dex" }]
}
```

### 1.3 Cure Wounds (Evocation, Touch, Healing)

```json
{
  "name": "Cure Wounds",
  "level": 1,
  "school": "Evocation",
  "casting_config": { "time_value": 1, "time_unit": "Action", "components": { "verbal": true, "somatic": true } },
  "range_config": { "type": "Touch" },
  "duration_config": { "type": "Instantaneous" },
  "mechanics_config": { "action_type": "None" },
  "damage_instances": [
    {
      "effect_type": "Healing",
      "dice_count": 1,
      "dice_value": 8,
      "flat_bonus_stat": "spellcasting_mod",
      "timing": "Instant"
    }
  ],
  "scaling_config": { "scales": true, "type": "Dice", "dice_count": 1, "dice_value": 8 }
}
```

### 1.4 Magic Missile (Evocation, Auto-Hit)

```json
{
  "name": "Magic Missile",
  "level": 1,
  "school": "Evocation",
  "casting_config": { "time_value": 1, "time_unit": "Action", "components": { "verbal": true, "somatic": true } },
  "range_config": { "type": "Ranged (Feet)", "distance": 120 },
  "duration_config": { "type": "Instantaneous" },
  "mechanics_config": { "action_type": "Auto-Hit" },
  "damage_instances": [
    {
      "effect_type": "Damage",
      "damage_type": "Force",
      "dice_count": 3,
      "dice_value": 4,
      "flat_bonus": 3,
      "timing": "Instant"
    }
  ],
  "scaling_config": { "scales": true, "type": "Target", "value": 1 }
}
```

### 1.5 Shield (Abjuration, Reaction)

```json
{
  "name": "Shield",
  "level": 1,
  "school": "Abjuration",
  "casting_config": {
    "time_value": 1,
    "time_unit": "Reaction",
    "reaction_trigger": "When hit by an attack or magic missile",
    "components": { "verbal": true, "somatic": true }
  },
  "range_config": { "type": "Self" },
  "duration_config": { "type": "Rounds", "value": 1 },
  "mechanics_config": { "action_type": "None" },
  "condition_instances": [{ "condition": "Special", "description": "+5 AC, Immune to Magic Missile" }]
}
```

### 1.6 Flaming Sphere (Conjuration, Concentration, DoT)

```json
{
  "name": "Flaming Sphere",
  "level": 2,
  "school": "Conjuration",
  "casting_config": {
    "time_value": 1,
    "time_unit": "Action",
    "components": { "verbal": true, "somatic": true, "material": true }
  },
  "range_config": { "type": "Ranged (Feet)", "distance": 60, "aoe_shape": "Sphere", "aoe_size": 5 },
  "duration_config": { "type": "Time-Limited", "value": 1, "unit": "Minutes", "concentration": true },
  "mechanics_config": { "action_type": "Dexterity Save", "save_effect": "Half" },
  "damage_instances": [
    { "effect_type": "Damage", "damage_type": "Fire", "dice_count": 2, "dice_value": 6, "timing": "End of Turn" }
  ],
  "scaling_config": { "scales": true, "type": "Dice", "dice_count": 1, "dice_value": 6 }
}
```

---

## 2. EQUIPMENT (6 Examples)

### 2.1 Longsword (Versatile, Martial)

```json
{
  "name": "Longsword",
  "category": "Martial Melee",
  "cost": 15,
  "cost_unit": "gp",
  "weight": 3,
  "damage_dice": "1d8",
  "damage_type": "Slashing",
  "properties": ["Versatile (1d10)"]
}
```

### 2.2 Dagger (Finesse, Light, Thrown)

```json
{
  "name": "Dagger",
  "category": "Simple Melee",
  "cost": 2,
  "cost_unit": "gp",
  "weight": 1,
  "damage_dice": "1d4",
  "damage_type": "Piercing",
  "properties": ["Finesse", "Light", "Thrown (20/60)"],
  "range_normal": 20,
  "range_long": 60
}
```

### 2.3 Shortbow (Two-Handed, Ammunition)

```json
{
  "name": "Shortbow",
  "category": "Simple Ranged",
  "cost": 25,
  "cost_unit": "gp",
  "weight": 2,
  "damage_dice": "1d6",
  "damage_type": "Piercing",
  "properties": ["Ammunition", "Two-Handed"],
  "range_normal": 80,
  "range_long": 320
}
```

### 2.4 Plate Armor (Heavy, Str Req)

```json
{
  "name": "Plate Armor",
  "category": "Heavy Armor",
  "cost": 1500,
  "cost_unit": "gp",
  "weight": 65,
  "ac_base": 18,
  "dex_bonus": false,
  "str_min": 15,
  "stealth_disadvantage": true
}
```

### 2.5 Shield (Item)

```json
{
  "name": "Shield",
  "category": "Shield",
  "cost": 10,
  "cost_unit": "gp",
  "weight": 6,
  "ac_base": 2
}
```

### 2.6 Potion of Healing (Consumable)

```json
{
  "name": "Potion of Healing",
  "category": "Potion",
  "weight": 0.5,
  "action_def": {
    "action_type": "Utility",
    "damage_instances": [{ "effect_type": "Healing", "dice_count": 2, "dice_value": 4, "flat_bonus": 2 }]
  }
}
```

---

## 3. MONSTERS (6 Examples)

### 3.1 Goblin (Small, Nimble Escape)

```json
{
  "name": "Goblin",
  "size": "Small",
  "type": "Humanoid",
  "ac": 15,
  "hp": 7,
  "speed": 30,
  "stats": { "str": 8, "dex": 14, "con": 10, "int": 10, "wis": 8, "cha": 8 },
  "actions": [
    { "name": "Scimitar", "type": "Melee Weapon", "hit_bonus": 4, "damage": "1d6+2 Slashing" },
    { "name": "Shortbow", "type": "Ranged Weapon", "hit_bonus": 4, "damage": "1d6+2 Piercing" }
  ],
  "features": [{ "name": "Nimble Escape", "desc": "Can take Disengage or Hide action as Bonus Action." }]
}
```

### 3.2 Ogre (Large, Simple Brute)

```json
{
  "name": "Ogre",
  "size": "Large",
  "type": "Giant",
  "ac": 11,
  "hp": 59,
  "actions": [
    { "name": "Greatclub", "type": "Melee Weapon", "hit_bonus": 6, "damage": "2d8+4 Bludgeoning" },
    { "name": "Javelin", "type": "Ranged Weapon", "hit_bonus": 6, "damage": "2d6+4 Piercing" }
  ]
}
```

### 3.3 Bandit Captain (Multiattack, Reaction)

```json
{
  "name": "Bandit Captain",
  "ac": 15,
  "hp": 65,
  "actions": [
    {
      "name": "Multiattack",
      "desc": "Makes three melee attacks: two with Scimitar, one with Dagger. Or two ranged attacks with Dagger.",
      "multiattack_logic": [
        { "action_id": "scimitar", "count": 2 },
        { "action_id": "dagger", "count": 1 }
      ]
    },
    { "name": "Scimitar", "hit_bonus": 5, "damage": "1d6+3 Slashing" },
    { "name": "Dagger", "hit_bonus": 5, "damage": "1d4+3 Piercing" }
  ],
  "reactions": [{ "name": "Parry", "desc": "Add +2 to AC against one melee attack." }]
}
```

### 3.4 Adult Red Dragon (Legendary, Lair, Breath)

```json
{
  "name": "Adult Red Dragon",
  "size": "Huge",
  "type": "Dragon",
  "ac": 19,
  "hp": 256,
  "actions": [
    { "name": "Multiattack", "desc": "One Frightful Presence, then one Bite and two Claws." },
    { "name": "Bite", "hit_bonus": 14, "damage": "2d10+8 Piercing + 1d8 Fire" },
    { "name": "Fire Breath", "recharge": "5-6", "aoe": "60ft Cone", "save": "Dex DC 21", "damage": "18d6 Fire" }
  ],
  "legendary_actions": {
    "count": 3,
    "options": [
      { "name": "Determine", "cost": 1, "desc": "Wisdom (Perception) check." },
      { "name": "Tail Attack", "cost": 1, "hit_bonus": 14, "damage": "2d8+8 Bludgeoning" },
      {
        "name": "Wing Attack",
        "cost": 2,
        "aoe": "10ft Radius",
        "save": "Dex DC 22",
        "damage": "2d6+8 Bludgeoning + Prone"
      }
    ]
  }
}
```

### 3.5 Lich (Spellcaster, Undead)

```json
{
  "name": "Lich",
  "cr": 21,
  "spellcasting": {
    "level": 18,
    "ability": "Int",
    "dc": 20,
    "slots": { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 1, "7": 1, "8": 1, "9": 1 }
  },
  "actions": [
    {
      "name": "Paralyzing Touch",
      "type": "Melee Spell",
      "hit_bonus": 12,
      "damage": "3d6 Cold",
      "condition": "Paralyzed"
    }
  ]
}
```

### 3.6 Gelatinous Cube (Condition Heavy)

```json
{
  "name": "Gelatinous Cube",
  "size": "Large",
  "type": "Ooze",
  "actions": [
    { "name": "Engulf", "save": "Dex DC 12", "damage": "3d6 Acid", "condition": "Restrained/Engulfed" },
    { "name": "Pseudopod", "damage": "3d6 Acid" }
  ]
}
```

---

## 4. CHARACTERS (6 Examples)

### 4.1 Fighter (Champion)

```json
{
  "class": "Fighter",
  "level": 5,
  "subclass": "Champion",
  "stats": { "str": 18, "con": 16 },
  "features": ["Action Surge (1/SR)", "Second Wind (1/SR)", "Extra Attack"],
  "equipment": ["Greatsword", "Plate Armor"]
}
```

### 4.2 Wizard (Evocation)

```json
{
  "class": "Wizard",
  "level": 5,
  "subclass": "School of Evocation",
  "stats": { "int": 18, "wis": 14 },
  "spell_config": {
    "spellbook": ["Fireball", "Mage Armor", "Shield", "Magic Missile", "Sleep", "Detect Magic"],
    "prepared": ["Fireball", "Mage Armor", "Shield", "Magic Missile"]
  },
  "slots": { "1": 4, "2": 3, "3": 2 }
}
```

### 4.3 Rogue (Thief)

```json
{
  "class": "Rogue",
  "level": 3,
  "subclass": "Thief",
  "stats": { "dex": 16, "int": 12 },
  "features": ["Sneak Attack (2d6)", "Cunning Action", "Fast Hands"],
  "equipment": ["Shortsword", "Shortbow", "Leather Armor"]
}
```

### 4.4 Cleric (Life)

```json
{
  "class": "Cleric",
  "level": 3,
  "subclass": "Life Domain",
  "stats": { "wis": 16, "str": 14 },
  "spell_config": {
    "prepared": ["Cure Wounds", "Bless", "Spiritual Weapon"],
    "domain_spells": ["Bless", "Cure Wounds"]
  },
  "slots": { "1": 4, "2": 2 }
}
```

### 4.5 Warlock (Fiend, Pact of Blade)

```json
{
  "class": "Warlock",
  "level": 5,
  "subclass": "The Fiend",
  "pact": "Pact of the Blade",
  "invocations": ["Thirsting Blade", "Agonizing Blast"],
  "spell_config": {
    "known": ["Hex", "Fireball", "Hellish Rebuke"],
    "pact_slots": { "level": 3, "max": 2, "per": "Short Rest" }
  }
}
```

### 4.6 Paladin / Sorcerer (Multiclass)

```json
{
  "classes": [
    { "class": "Paladin", "level": 2 },
    { "class": "Sorcerer", "level": 3, "subclass": "Divine Soul" }
  ],
  "stats": { "str": 16, "cha": 16 },
  "features": ["Divine Smite", "Font of Magic"],
  "spell_config": {
    "prepared_paladin": ["Bless", "Cure Wounds"],
    "known_sorcerer": ["Shield", "Absorb Elements"]
  },
  "slots": { "1": 4, "2": 2 }
  // (Paladin 1 + Sorcerer 3 = level 4 caster)
}
```
