import os
import json
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, model_name: str = "gemma4L:e4b"):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = model_name
        # Using a timeout as local inference can sometimes be slow
        self.client = httpx.Client(timeout=60.0)

    def generate_json(self, prompt: str) -> dict:
        """
        Generates a JSON response from Ollama.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        try:
            response = self.client.post(f"{self.base_url}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return json.loads(data.get("response", "{}"))
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON from Ollama response.")
            return {"error": "Invalid JSON response from model"}
        except Exception as e:
            logger.error(f"Error calling Ollama API: {e}")
            return {"error": str(e)}

    def generate_text(self, prompt: str) -> str:
        """
        Generates a plain text response from Ollama.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        try:
            response = self.client.post(f"{self.base_url}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            logger.error(f"Error calling Ollama API: {e}")
            return f"Error: {e}"
