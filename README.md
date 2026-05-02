# AI Trader: Agentic AI Trading System

A compliance-first, fail-closed agentic trading system for Indian retail markets, integrated with ICICI Direct Breeze API and powered by local Ollama LLM inference.

## 🚀 Overview

AI Trader is a multi-agent system designed for automated trade signaling, risk validation, and market execution. It prioritizes regulatory compliance and operational safety through a "fail-closed" architecture.

### Key Features
- **Broker Integration:** Seamless connection with ICICI Direct Breeze API.
- **Agentic Orchestration:** Multi-agent architecture (Signal, Sentiment, Risk, Execution) coordinated by a central orchestrator.
- **Inference:** Utilizes local Ollama for LLM processing.
- **Visual Oversight:** Interactive UI built with React Flow for real-time monitoring and agent visualization.
- **Regulatory Guardrails:** Enforces policies such as 10 Orders Per Second (OPS), static IP egress, and limit-order-only execution.

## 🏗️ Architecture

- **Frontend:** React, TypeScript, Vite, React Flow, Tailwind CSS.
- **Backend:** FastAPI, Python, Redis (Caching/PubSub), PostgreSQL (Transactional).
- **Inference:** Ollama (Local LLMs).
- **Deployment:** Docker, Nginx.

## 📁 Project Structure

```
AI Trader/
├── backend/            # FastAPI backend & Trading Agents
├── frontend/           # React + Vite frontend
├── docker-compose.yml  # Container orchestration
└── ...
```

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- ICICI Direct Breeze API Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abaijal0202/AI-Trader.git
   cd AI-Trader
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Run with Docker:**
   ```bash
   docker-compose up -d
   ```

## 🛡️ Compliance & Safety
- **Fail-Closed:** Defaults to no-trade on any system failure (auth, data staleness, risk gateway).
- **Deterministic Validation:** LLM outputs are never directly executed; they must pass strict risk filters.
- **Audit Trails:** Full logging of prompts, signals, and execution decisions.

## 📜 License
This project is licensed under the MIT License.
