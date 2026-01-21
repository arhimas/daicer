import sys
import json
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', stream=sys.stderr)
logger = logging.getLogger("LLM-Bridge")

class LLMService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.current_model_id = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Apple Silicon override
        if torch.backends.mps.is_available():
            self.device = "mps"
        
        logger.info(f"Initialized LLMService on device: {self.device}")

    def load_model(self, model_id, quantization=None):
        if self.current_model_id == model_id:
            logger.info(f"Model {model_id} already loaded.")
            return

        logger.info(f"Loading model: {model_id}...")
        
        try:
            token = os.environ.get("HF_TOKEN")
            
            # Load Tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=token)
            
            # Load Model
            # Handling quantization based on args or default logic
            # For "SOTA" handling, we generally trust 'auto' or explicit bitsandbytes config
            # But plain 'auto' with accelerate is usually best for standard cases
            
            load_kwargs = {
                "device_map": "auto",
                "token": token,
                "trust_remote_code": True # Often needed for new architectures like Gemma 3
            }
            
            if quantization == '8bit':
                load_kwargs["load_in_8bit"] = True
            elif quantization == '4bit':
                load_kwargs["load_in_4bit"] = True
            elif self.device == "mps":
                # MPS doesn't support 8bit/4bit bitsandbytes natively usually, fallback to float16
                load_kwargs["torch_dtype"] = torch.float16
                # device_map="auto" usually works well, but explicit might be safer for mps
                
            
            self.model = AutoModelForCausalLM.from_pretrained(model_id, **load_kwargs)
            
            self.current_model_id = model_id
            logger.info(f"Successfully loaded {model_id}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise e

    def generate(self, prompt, max_new_tokens=256, temperature=0.7):
        if not self.model or not self.tokenizer:
            raise ValueError("Model not loaded. Call load_model first.")

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                do_sample=True,
                top_k=40,
                top_p=0.95
            )
            
        decoded = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Remove prompt from output if needed, or return full. Usually full is returned.
        # We will return clean text.
        # Heuristic: simple strip of prompt might incur edge cases, usually user handles it
        # But 'chat' templates are better handled by tokenizer.apply_chat_template if passed list.
        # For raw string prompt, we just return generation.
        
        # If the model behaves like a completion engine, it appends.
        # We'll return just the full string for now.
        return decoded

service = LLMService()

def main():
    logger.info("Bridge started. Waiting for input...")
    while True:
        try:
            # Read line from stdin
            line = sys.stdin.readline()
            if not line:
                break
            
            data = json.loads(line)
            req_id = data.get("id")
            command = data.get("command")
            payload = data.get("payload", {})
            
            response = {"id": req_id, "status": "success", "data": None}
            
            try:
                if command == "load":
                    service.load_model(payload.get("model"), payload.get("quantization"))
                    response["data"] = "Model loaded"
                
                elif command == "generate":
                    text = service.generate(
                        payload.get("prompt"), 
                        payload.get("max_new_tokens", 256),
                        payload.get("temperature", 0.7)
                    )
                    response["data"] = text
                    
                else:
                    raise ValueError(f"Unknown command: {command}")
                    
            except Exception as e:
                logger.error(f"Error processing {command}: {e}")
                response["status"] = "error"
                response["error"] = str(e)
            
            # Write response to stdout
            print(json.dumps(response))
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.critical(f"Fatal loop error: {e}")

if __name__ == "__main__":
    main()
