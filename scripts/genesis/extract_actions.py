import os
import json
import time
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Define strict Enums
ACTION_TYPES = ["melee", "ranged", "spell", "utility", "ability"]
RANGE_TYPES = ["Self", "Touch", "Ranged (Feet)", "Ranged (Miles)", "Sight", "Unlimited"]
AOE_SHAPES = ["Cone", "Cube", "Cylinder", "Line", "Sphere", "Hemisphere"]
MECHANIC_ACTIONS = ["Melee Spell Attack", "Ranged Spell Attack", "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save", "Auto-Hit", "None"]
SAVE_EFFECTS = ["Negate", "Half", "None"]
EFFECT_TYPES = ["Damage", "Healing", "TempHP"]
DAMAGE_TYPES = ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"]
TIMING = ["Instant", "Start of Turn", "End of Turn", "One Time Trigger"]
CONDITIONS = ["Blinded", "Charmed", "Deafened", "Exhaustion", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious", "Special"]
SAVE_ATTRIBUTES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]

# Pydantic Schemas for Structured Output
class RangeConfig(BaseModel):
    type: str = Field(description=f"One of: {', '.join(RANGE_TYPES)}")
    distance: Optional[int] = None
    aoe_shape: Optional[str] = Field(None, description=f"One of: {', '.join(AOE_SHAPES)}")
    aoe_size: Optional[int] = None

class MechanicsConfig(BaseModel):
    action_type: str = Field(description=f"One of: {', '.join(MECHANIC_ACTIONS)}")
    save_effect: Optional[str] = Field(None, description=f"One of: {', '.join(SAVE_EFFECTS)}")

class SaveConfig(BaseModel):
    dc: int = Field(description="The DC (e.g. 14)")
    attribute: str = Field(description=f"One of: {', '.join(SAVE_ATTRIBUTES)}")

class DamageInstance(BaseModel):
    effect_type: str = Field(default="Damage", description=f"One of: {', '.join(EFFECT_TYPES)}")
    damage_type: Optional[str] = Field(None, description=f"One of: {', '.join(DAMAGE_TYPES)}")
    dice_count: int = 0
    dice_value: int = 0
    flat_bonus: int = 0
    timing: str = Field(default="Instant", description=f"One of: {', '.join(TIMING)}")

class ConditionInstance(BaseModel):
    condition: str = Field(description=f"One of: {', '.join(CONDITIONS)}")
    description: Optional[str] = None
    chance: int = 100
    duration_rounds: Optional[int] = None

class ActionItem(BaseModel):
    name: str = Field(description="Name of the action or legendary action")
    description: str = Field(description="Exact descriptive text")
    type: str = Field(default="melee", description=f"One of: {', '.join(ACTION_TYPES)}")
    toHit: Optional[int] = Field(None, description="Bonus to hit, e.g., 5")
    range_config: Optional[RangeConfig] = None
    mechanics_config: Optional[MechanicsConfig] = None
    save: Optional[SaveConfig] = None
    damage_instances: Optional[List[DamageInstance]] = None
    condition_instances: Optional[List[ConditionInstance]] = None

class ActionExtractionList(BaseModel):
    actions: List[ActionItem]

from concurrent.futures import ThreadPoolExecutor, as_completed

def process_single_monster(file: str, monsters_dir: str, actions_dir: str, client: genai.Client):
    file_path = os.path.join(monsters_dir, file)
    with open(file_path, 'r', encoding='utf-8') as fs:
        raw_data = json.load(fs)
    
    if isinstance(raw_data, list):
        if not raw_data: return False
        raw_data = raw_data[0]
        
    monster = raw_data.get('monster', raw_data)
    monster_slug = file.replace('.json', '')
    
    text_blocks = []
    if monster.get('special_abilities'): text_blocks.append(f"**Special Abilities:**\n{monster['special_abilities']}")
    if monster.get('actions'): text_blocks.append(f"**Actions:**\n{monster['actions']}")
    if monster.get('legendary_actions'): text_blocks.append(f"**Legendary Actions:**\n{monster['legendary_actions']}")
    
    full_text = '\n\n'.join(text_blocks).strip()
    if not full_text: 
        # No actions to extract, completes instantly without LLM
        return True
        
    # Skip logic: if we already have JSON files for this monster slug, assume it's done.
    existing = [f for f in os.listdir(actions_dir) if f.startswith(f"{monster_slug}-") and f.endswith('.json')]
    if existing:
        print(f"⏭️  Skipped {monster.get('name')} (Found {len(existing)} existing actions)")
        return True
    
    prompt = f"Extract all unique actions and abilities from this {monster.get('name')} stat block:\n\n{full_text}"
    
    retries = 3
    while retries > 0:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ActionExtractionList,
                    temperature=0.1
                ),
            )
            
            result = json.loads(response.text)
            import re
            for action in result.get('actions', []):
                action_name_clean = re.sub(r'[^a-z0-9]+', '-', action.get('name', 'action').lower()).strip('-')
                action_slug = f"{monster_slug}-{action_name_clean}"
                
                action['slug'] = action_slug
                
                out_path = os.path.join(actions_dir, f"{action_slug}.json")
                with open(out_path, 'w', encoding='utf-8') as out_f:
                    json.dump(action, out_f, indent=2)
                    
            print(f"✅ Extracted: {monster.get('name')}")
            return True
        except Exception as e:
            retries -= 1
            if retries == 0:
                print(f"⚠️ Failed {monster.get('name')}: {e}")
            time.sleep(2)
    return False

def run_concurrent_extraction():
    print("🔄 Starting Fast Concurrent Python Action Extractor...")
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    
    monsters_dir = os.path.join(os.getcwd(), 'seed-data', 'monster')
    actions_dir = os.path.join(os.getcwd(), 'seed-data', 'action')
    os.makedirs(actions_dir, exist_ok=True)
    
    files = [f for f in os.listdir(monsters_dir) if f.endswith('.json')]
    success_count = 0
    
    # 5 workers to stay under RPM/TPM limits but still be fast
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_single_monster, f, monsters_dir, actions_dir, client): f for f in files}
        
        for future in as_completed(futures):
            try:
                if future.result():
                    success_count += 1
            except Exception as e:
                print(f"Exception generated in thread: {e}")
                
    print(f"\n🏁 Finished. Processed {success_count} monsters successfully.")

if __name__ == "__main__":
    run_concurrent_extraction()
