from google import genai
from google.genai import types
import json
import os

class SentimentAgent:
    """
    Collects news and computes symbol-level sentiment using Gemini Pro.
    """
    def __init__(self, model_name: str = "gemini-3.0-pro"):
        self.model = model_name
        self.client = genai.Client() # Assumes GEMINI_API_KEY is in environment

    async def analyze_sentiment(self, news_text: str) -> dict:
        prompt = f"Analyze the sentiment of the following news for trading signals. Return ONLY a JSON object with 'sentiment' (bullish/bearish/neutral) and 'score' (0-100):\n{news_text}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            # Fallback in case of error
            return {"sentiment": "neutral", "score": 50, "error": str(e)}
