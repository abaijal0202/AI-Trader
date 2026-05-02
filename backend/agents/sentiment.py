from agents.llm_utils import OllamaClient
import logging

logger = logging.getLogger(__name__)

class SentimentAgent:
    """
    Collects news and computes symbol-level sentiment using Ollama.
    """
    def __init__(self, model_name: str = "gemma4L:e4b"):
        self.llm = OllamaClient(model_name=model_name)

    async def analyze_sentiment(self, news_text: str) -> dict:
        prompt = (
            "Analyze the sentiment of the following news for trading signals. "
            "Return ONLY a JSON object with 'sentiment' (bullish/bearish/neutral), "
            "'score' (0-100), and 'reasoning' (a brief explanation).\n\n"
            f"News Text: {news_text}"
        )
        
        result = self.llm.generate_json(prompt)
        if "error" in result:
            return {"sentiment": "neutral", "score": 50, "reasoning": "Fallback due to API error."}
        return result
