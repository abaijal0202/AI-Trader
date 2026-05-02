from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from agents.orchestrator import OrchestratorAgent
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="Agentic AI Trading System",
    description="Backend for the Multi-Agent Trading Platform integrating with ICICI Breeze API.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Agentic AI Trading System API is running."}

@app.get("/health")
async def health_check():
    # In a real scenario, this would check DB and Redis connectivity
    return {"status": "healthy"}

class RunRequest(BaseModel):
    symbol: str

@app.post("/run/{symbol}")
async def run_cycle(symbol: str):
    try:
        # Note: breeze_client is passed as None for now to allow execution without valid keys in testing.
        # In a real scenario, the initialized BreezeClient should be passed here.
        orchestrator = OrchestratorAgent(breeze_client=None)
        result = await orchestrator.run_cycle(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
