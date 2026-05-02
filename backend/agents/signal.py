import pandas as pd
from typing import Dict, Any
from agents.llm_utils import OllamaClient

class SignalAgent:
    """
    Computes technical indicators and ranks candidate trades using Ollama for reasoning.
    """
    def __init__(self, model_name: str = "gemma4L:e4b"):
        self.llm = OllamaClient(model_name=model_name)

    def generate_signals(self, market_data: pd.DataFrame, sentiment: dict) -> Dict[str, Any]:
        # Implementation of RSI, MACD, etc. (mocked here)
        technical_summary = "RSI is 30 (oversold), MACD crossover detected."
        
        prompt = (
            "Based on the following market data summary and sentiment, provide a trading action (buy/sell/hold) "
            "and a detailed reason. Return ONLY a JSON object with 'action', 'confidence', and 'reason'.\n\n"
            f"Technical Data: {technical_summary}\n"
            f"Sentiment: {sentiment.get('sentiment')} (Score: {sentiment.get('score')})"
        )
        
        result = self.llm.generate_json(prompt)
        if "error" in result:
            return {
                "action": "hold",
                "confidence": 0,
                "reason": "Error generating signal reasoning."
            }
        return result
