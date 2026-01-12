import sys
import json
import logging
import signal
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ValidationError
from sentence_transformers import SentenceTransformer

import warnings

# Suppress HuggingFace/Jina specific warnings
warnings.filterwarnings("ignore", message=".*`torch_dtype` is deprecated.*")

# Configure SOTA Logging
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("embedding_service")

# Constants
MODEL_NAME = "jinaai/jina-embeddings-v3"
EmbeddingTask = Literal['retrieval.query', 'retrieval.passage', 'text-matching', 'separation', 'classification']

# --- Schema Definitions ---

class EmbeddingRequest(BaseModel):
    """
    Strict schema for incoming embedding requests.
    """
    text: str = Field(..., min_length=1, description="The text content to embed.")
    task: EmbeddingTask = Field(default="text-matching", description="The downstream task for the embedding.")

class EmbeddingResponse(BaseModel):
    """
    Strict schema for outgoing embedding responses.
    """
    vector: Optional[List[float]] = None
    error: Optional[str] = None
    status: Optional[str] = None

# --- Service Implementation ---

class EmbeddingEngine:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model: Optional[SentenceTransformer] = None

    def load_model(self) -> None:
        try:
            # trust_remote_code=True is required for Jina V3 custom architecture
            self.model = SentenceTransformer(self.model_name, trust_remote_code=True)
            # Optimization: Move to MPS (Metal Performance Shaders) on Mac if available
            # Note: Explicit device handling can be added here if needed, ST usually auto-detects.
            # self.model.to('mps')
            logger.info(f"Model {self.model_name} loaded successfully.")
        except Exception as e:
            logger.critical(f"Failed to load model {self.model_name}: {e}")
            raise e

    def generate(self, text: str, task: str) -> List[float]:
        if not self.model:
            raise RuntimeError("Model not initialized")
        
        # Jina V3 uses 'task' for the LoRA adapter.
        # Some versions/wrappers might use 'prompt_name' as an alias or additional config.
        # We pass both to be safe and compliant with user suggestion.
        embeddings = self.model.encode([text], task=task, prompt_name=task)
        
        # Verify output shape and type
        if len(embeddings) == 0:
            raise ValueError("Model returned empty embedding")
            
        return embeddings[0].tolist()

def handle_exit(signum, frame):
    logger.info("Received termination signal. Exiting.")
    sys.exit(0)

def main() -> None:
    # Graceful shutdown
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    engine = EmbeddingEngine(MODEL_NAME)
    
    try:
        engine.load_model()
        # Signal readiness to parent process
        print(EmbeddingResponse(status="ready").model_dump_json(), flush=True)
    except Exception:
        sys.exit(1)

    # Main Event Loop
    for line in sys.stdin:
        if not line:
            continue
        
        try:
            # 1. Parse & Validate
            try:
                data = json.loads(line)
                request = EmbeddingRequest(**data)
            except json.JSONDecodeError:
                print(EmbeddingResponse(error="Invalid JSON").model_dump_json(), flush=True)
                continue
            except ValidationError as ve:
                print(EmbeddingResponse(error=f"Validation Error: {ve}").model_dump_json(), flush=True)
                continue

            # 2. Execute
            try:
                vector = engine.generate(request.text, request.task)
                print(EmbeddingResponse(vector=vector).model_dump_json(), flush=True)
            except Exception as e:
                logger.error(f"Inference Logic Error: {e}")
                print(EmbeddingResponse(error=str(e)).model_dump_json(), flush=True)

        except Exception as critical_err:
            # Catch-all for unexpected loop failures
            logger.critical(f"Critical Loop Error: {critical_err}")
            print(EmbeddingResponse(error="Internal Server Error").model_dump_json(), flush=True)

if __name__ == "__main__":
    main()
