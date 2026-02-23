import os
import json
import time
import re
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from concurrent.futures import ThreadPoolExecutor, as_completed

class SpellExtraction(BaseModel):
    spells: List[str] = Field(description="A list of strict hyphenated spell slugs extracted from the description, e.g. 'mage-armor', 'fireball'. Lowercase and hyphenated only.")

def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def extract_spells_for_action(action_path: str, client: genai.Client) -> List[str]:
    with open(action_path, 'r', encoding='utf-8') as f:
        action = json.load(f)
        
    desc = action.get('description', '')
    if not desc:
        return []
        
    prompt = f"Extract all specific spells mentioned in this spellcasting description as an array of lowercase hyphenated slugs (e.g., if it says 'Mage Armor', return 'mage-armor'). ONLY return standard spells, do not return feature names. Description: {desc}"
    
    retries = 3
    while retries > 0:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SpellExtraction,
                    temperature=0.0
                ),
            )
            result = json.loads(response.text)
            spells = result.get('spells', [])
            return [slugify(s) for s in spells if s]
        except Exception as e:
            retries -= 1
            if retries == 0:
                print(f"⚠️ Spell extraction failed for {action.get('name')}: {e}")
            time.sleep(2)
    return []

def process_single_entity(entity_file: str, entities_dir: str, actions_dir: str, client: genai.Client):
    entity_path = os.path.join(entities_dir, entity_file)
    with open(entity_path, 'r', encoding='utf-8') as f:
        entity = json.load(f)
        
    # If it already has spells, skip
    if entity.get('spells') is not None:
        return None

    # Find the entity's linked actions
    actions = entity.get('actions', [])
    if not actions:
        # Mark as processed with empty array so we don't scan again
        entity['spells'] = []
        with open(entity_path, 'w', encoding='utf-8') as f:
            json.dump(entity, f, indent=2)
        return False
        
    # Look for any action slug containing 'spellcasting'
    spellcasting_actions = [a for a in actions if 'spellcasting' in a.lower()]
    
    if not spellcasting_actions:
        # No spellcasting actions, mark empty
        entity['spells'] = []
        with open(entity_path, 'w', encoding='utf-8') as f:
            json.dump(entity, f, indent=2)
        return False
        
    all_spells = set()
    for action_slug in spellcasting_actions:
        action_path = os.path.join(actions_dir, f"{action_slug}.json")
        if not os.path.exists(action_path): continue
        
        extracted = extract_spells_for_action(action_path, client)
        for s in extracted:
            all_spells.add(s)
            
    if all_spells:
        entity['spells'] = sorted(list(all_spells))
        with open(entity_path, 'w', encoding='utf-8') as f:
            json.dump(entity, f, indent=2)
        print(f"🪄 Extracted {len(all_spells)} spells for {entity.get('name')}")
        return True
    else:
        # Tried but found nothing
        entity['spells'] = []
        with open(entity_path, 'w', encoding='utf-8') as f:
            json.dump(entity, f, indent=2)
        return False

def run_spell_extraction():
    print("🔄 Starting Monster Spell Link Extraction...")
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    
    entities_dir = os.path.join(os.getcwd(), 'seed-data', 'entity')
    actions_dir = os.path.join(os.getcwd(), 'seed-data', 'action')
    
    files = [f for f in os.listdir(entities_dir) if f.endswith('.json')]
    
    success_count = 0
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_single_entity, f, entities_dir, actions_dir, client): f for f in files}
        
        for future in as_completed(futures):
            try:
                if future.result():
                    success_count += 1
            except Exception as e:
                print(f"Thread Error: {e}")
                
    print(f"\n🏁 Finished. Linked spells for {success_count} monsters.")

if __name__ == "__main__":
    run_spell_extraction()
