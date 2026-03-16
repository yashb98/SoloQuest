---
description: Start and develop the Python agent backend
---

1. Ensure the Next.js web API is running: `cd apps/web && npm run dev`
2. Start the FastAPI agent server: `cd agents && uvicorn src.soloquest_agents.server:app --reload`
3. Check Langfuse dashboard for traces: open configured LANGFUSE_HOST URL
4. Test an agent: `curl -X POST http://localhost:8000/agents/health-sync -H "Content-Type: application/json" -d '{"steps": 8000, "date": "2026-03-16"}'`

Agent files:
- `agents/src/soloquest_agents/graph.py` — Main LangGraph supervisor graph
- `agents/src/soloquest_agents/agents/*.py` — Individual agent implementations
- `agents/src/soloquest_agents/tools/*.py` — Agent tools (API client, parsers)
- `agents/src/soloquest_agents/llm/router.py` — LLM routing (Kimi vs Anthropic)

$ARGUMENTS
