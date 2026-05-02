import asyncio
import logging
from typing import Dict, Any
from agents.market_data import MarketDataAgent
from agents.sentiment import SentimentAgent
from agents.signal import SignalAgent
from agents.risk import RiskAgent
from agents.execution import ExecutionAgent
from agents.llm_utils import OllamaClient

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    """
    Coordinates workflow, scheduling, and state handoff between agents.
    Uses Ollama for high-level cycle summarization.
    """
    def __init__(self, breeze_client):
        self.state = "IDLE"
        self.market_data_agent = MarketDataAgent(breeze_client)
        self.sentiment_agent = SentimentAgent()
        self.signal_agent = SignalAgent()
        self.risk_agent = RiskAgent()
        self.execution_agent = ExecutionAgent(breeze_client)
        self.llm = OllamaClient()

    async def run_cycle(self, symbol: str) -> Dict[str, Any]:
        logger.info(f"Starting orchestrator cycle for {symbol}")
        self.state = "RUNNING"
        
        try:
            # 1. Market Data Fetch
            data = await self.market_data_agent.fetch_historical_data(symbol)
            
            # 2. Sentiment Fetch (Mocked news text)
            news_text = f"Market is showing strong interest in {symbol} following recent earnings report."
            sentiment = await self.sentiment_agent.analyze_sentiment(news_text)
            
            # 3. Signal Generation
            signal = self.signal_agent.generate_signals(data, sentiment)
            
            # 4. Risk Validation
            is_valid = self.risk_agent.evaluate_trade(signal, current_exposure=0)
            
            # 5. Execution (if valid and action is buy/sell)
            execution_result = {}
            if is_valid and signal.get("action") in ["buy", "sell"]:
                # execution_result = await self.execution_agent.execute_trade(symbol, signal["action"])
                execution_result = {"status": "simulated", "order_id": "SIM-123"}
            
            # 6. Final Summarization using Gemini
            summary_prompt = (
                f"Summarize the trading cycle for {symbol}. "
                f"Sentiment: {sentiment.get('sentiment')}, Signal: {signal.get('action')}, "
                f"Risk: {'Passed' if is_valid else 'Failed'}, Execution: {execution_result.get('status', 'N/A')}."
            )
            cycle_summary = self.llm.generate_text(summary_prompt)

            self.state = "IDLE"
            return {
                "status": "completed",
                "symbol": symbol,
                "sentiment": sentiment,
                "signal": signal,
                "risk_passed": is_valid,
                "execution": execution_result,
                "summary": cycle_summary
            }
        except Exception as e:
            logger.error(f"Error in orchestrator cycle: {e}")
            self.state = "IDLE"
            return {"status": "error", "message": str(e)}
