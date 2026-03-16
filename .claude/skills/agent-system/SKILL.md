---
name: agent-system
description: SoloQuest multi-agent AI system — LangGraph, Langfuse, Kimi API, FastAPI. Use when working on agents, agent orchestration, LLM routing, observability, or the Python backend.
allowed-tools: Read, Grep, Glob, Bash
---

# SoloQuest Agent System Reference

## Tech Stack
- **Orchestration:** LangGraph (Python) — supervisor + specialized agents
- **LLMs:** Kimi Code API (OpenAI-compatible, fast) + Anthropic Claude (complex)
- **Observability:** Langfuse — traces, cost tracking, latency, success rates
- **API Server:** FastAPI (async, auto-docs at /docs)
- **DB Access:** Read via libsql Python client, Write via Next.js API HTTP calls

## LangGraph Supervisor Pattern
```python
# graph.py — simplified
from langgraph.graph import StateGraph
from .state import AgentState

graph = StateGraph(AgentState)
graph.add_node("supervisor", supervisor_node)
graph.add_node("steps_agent", steps_node)
graph.add_node("expense_agent", expense_node)
# ... all 13 agents

graph.add_conditional_edges("supervisor", route_to_agent)
graph.set_entry_point("supervisor")
```

## State Schema
```python
class AgentState(TypedDict):
    event_type: str       # "health_sync", "notification", "periodic_check", etc.
    event_data: dict      # Raw data from mobile/cron
    hunter: dict          # Full hunter profile
    active_quests: list   # Today's active quests
    today_todos: list     # Today's todo items
    messages: list        # LLM conversation history
    actions_taken: list   # [{type, id, reason, undoable}]
    notifications: list   # Push notifications to send
    next_agent: str       # Supervisor routing decision
```

## LLM Router
```python
ROUTING = {
    "supervisor": "kimi",
    "steps_agent": "kimi",
    "screen_time_agent": "kimi",
    "expense_agent": "anthropic",    # Complex text parsing
    "todo_agent": "kimi",
    "quest_agent": "anthropic",      # Creative generation
    "streak_guardian": "kimi",
    "sleep_agent": "kimi",
    "weekly_strategist": "anthropic", # Complex analysis
    "daily_focus": "kimi",
    "notion_sync": "kimi",
    "adaptive_learning": "anthropic",
    "calendar_awareness": "kimi",
    "social_accountability": "anthropic",
}
```

Kimi Code API uses OpenAI SDK:
```python
from openai import OpenAI
kimi = OpenAI(api_key=KIMI_API_KEY, base_url="https://api.kimi.ai/v1")
```

## Langfuse Integration
```python
from langfuse.callback import CallbackHandler
handler = CallbackHandler(public_key=..., secret_key=..., host=...)
graph.invoke(state, config={"callbacks": [handler]})
```

## Key Rules
1. **Never write to DB directly** — always call Next.js API routes via HTTP
2. **Log every action** — create AgentRun record + Langfuse trace
3. **All actions must be undoable** — include undo info in actions_taken
4. **Graceful degradation** — if LLM fails, use hardcoded defaults
5. **Fallback chain** — Kimi → Anthropic → defaults (or reverse)

## FastAPI Endpoints
- Event-driven: `/agents/health-sync`, `/agents/screen-time-update`, `/agents/expense-notification`
- Interactive: `/agents/daily-focus`, `/agents/ask-recommendation`
- Scheduled: `/agents/morning-plan`, `/agents/check-progress`, `/agents/evening-wrap`, `/agents/weekly-strategy`
- Management: `/agents/status`, `/agents/actions`, `/agents/actions/undo`, `/agents/config`

## File Layout
```
agents/src/soloquest_agents/
├── server.py              # FastAPI app + endpoints
├── graph.py               # LangGraph supervisor graph
├── state.py               # AgentState TypedDict
├── config.py              # Env vars, Langfuse setup
├── agents/                # One file per agent
│   ├── steps_agent.py
│   ├── expense_agent.py
│   └── ... (13 total)
├── tools/
│   ├── soloquest_api.py   # Typed HTTP client to Next.js
│   ├── health_data.py     # Parse health payloads
│   └── notification_parser.py
└── llm/
    ├── kimi.py            # Kimi client wrapper
    ├── anthropic.py       # Anthropic client wrapper
    └── router.py          # Route agent → LLM
```
