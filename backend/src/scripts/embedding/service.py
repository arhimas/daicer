import sys
import json
import logging
from sentence_transformers import SentenceTransformer

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger("embedding_service")

MODEL_NAME = "jinaai/jina-embeddings-v3"

def main():
    try:
        # trust_remote_code=True is required for Jina V3
        model = SentenceTransformer(MODEL_NAME, trust_remote_code=True)
        # Force CPU or MPS if available (Mac)
        # model.to('mps') # Optional: Let ST decide or force if needed.
        
        logger.info(f"Model {MODEL_NAME} loaded successfully.")
        
        # Signal readiness
        print(json.dumps({"status": "ready"}), flush=True)

        for line in sys.stdin:
            if not line:
                continue
            
            try:
                data = json.loads(line)
                text = data.get("text")
                task = data.get("task", "text-matching") # default task
                
                if not text:
                    print(json.dumps({"error": "No text provided"}), flush=True)
                    continue

                # Jina V3 specific task encoding
                # The model handle task via specific adapters if using the wrapper, 
                # but sentence-transformers usually handles prompt wrapping internally if config is right.
                # Jina v3 documentation says: model.encode(texts, task="retrieval.passage")
                
                embeddings = model.encode([text], task=task)
                vector = embeddings[0].tolist()
                
                print(json.dumps({"vector": vector}), flush=True)
                
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON"}), flush=True)
            except Exception as e:
                logger.error(f"Error processing line: {e}")
                print(json.dumps({"error": str(e)}), flush=True)
                
    except Exception as e:
        logger.critical(f"Failed to load model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
