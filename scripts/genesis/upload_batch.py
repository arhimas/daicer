import os
from google import genai

def run_batch():
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    file_path = "scripts/genesis/action_batch_requests.jsonl"
    print(f"⬆️ Uploading {file_path} to Gemini...")
    
    uploaded_file = client.files.upload(
        file=file_path,
        config={
            "display_name": "Daicer Monster Actions Batch V1",
            "mime_type": "text/plain"
        }
    )
    print(f"✅ Uploaded File URI: {uploaded_file.uri}")
    
import requests
import json
import time

def run_batch():
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    
    file_path = "scripts/genesis/action_batch_requests.jsonl"
    print(f"⬆️ Uploading {file_path} to Gemini...")
    
    uploaded_file = client.files.upload(
        file=file_path,
        config={
            "display_name": "Daicer Monster Actions Batch V1",
            "mime_type": "text/plain"
        }
    )
    print(f"✅ Uploaded File URI: {uploaded_file.uri}")
    
    print("🚀 Triggering Batch Job via REST API...")
    url = f"https://generativelanguage.googleapis.com/v1beta/metadata/batches?key={api_key}" # Wait, the original URL was dropping the /metadata/ ? Actually let's just use the known v1beta/batches endpoint 
    url = f"https://generativelanguage.googleapis.com/v1beta/batches?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    # For file API, the URI should just be the name `files/xxxx` or the full URI. Let's try name first since the schema usually expects `files/ID`.
    payload = {
        "model": "models/gemini-2.5-flash",
        "requestsFile": uploaded_file.name,
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        batch_job = response.json()
        print("\n✅ Batch Job Created!")
        print(f"Job Name: {batch_job.get('name')}")
        print(f"Job State: {batch_job.get('state')}")
        print("\nTo check status, query the 'name' endpoint.")
        
        # Save job info for later retrieval
        with open("scripts/genesis/latest_batch_job.json", "w") as f:
            json.dump(batch_job, f)
    else:
        print(f"\n❌ Failed to create Batch Job ({response.status_code}):")
        print(response.text)

if __name__ == "__main__":
    run_batch()
