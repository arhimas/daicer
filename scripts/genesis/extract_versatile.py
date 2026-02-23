import os
import json
import time
from typing import Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

class VersatileExtraction(BaseModel):
    versatile_dice: str

def process_versatile_weapons():
    print("🔄 Starting Versatile Weapon Dice Extraction...")
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    
    items_dir = os.path.join(os.getcwd(), 'seed-data', 'item')
    if not os.path.exists(items_dir):
        print("No items directory found.")
        return
        
    files = [f for f in os.listdir(items_dir) if f.endswith('.json')]
    
    success_count = 0
    skip_count = 0
    
    for file in files:
        file_path = os.path.join(items_dir, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            item = json.load(f)
            
        eq_data = item.get('equipment_data', {})
        if not eq_data:
            continue
            
        props = eq_data.get('properties', [])
        if not props or 'versatile' not in [p.lower() for p in (props if isinstance(props, list) else [])]:
            continue
            
        # If we already extracted it, skip
        if eq_data.get('versatile_dice'):
            skip_count += 1
            continue
            
        desc = item.get('description', '')
        if not desc:
            continue
            
        prompt = f"Extract ONLY the versatile (two-handed) damage dice from this weapon description (e.g., '1d10', '1d8'). Description: {desc}"
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=VersatileExtraction,
                    temperature=0.0
                ),
            )
            result = json.loads(response.text)
            dice = result.get('versatile_dice')
            
            if dice:
                item['equipment_data']['versatile_dice'] = dice
                print(f"✅ Extracted Versatile Dice for {item.get('name')}: {dice}")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(item, f, indent=2)
                success_count += 1
                
        except Exception as e:
            print(f"⚠️ Failed on {item.get('name')}: {e}")
            
    print(f"\n🏁 Finished. Extracted {success_count} versatile dice. Skipped {skip_count} already processed.")

if __name__ == "__main__":
    process_versatile_weapons()
