---
description: Add a new AI agent to the SoloQuest agent backend
---

1. Read `agents/src/soloquest_agents/graph.py` to understand the supervisor pattern
2. Read an existing agent (e.g., `agents/src/soloquest_agents/agents/steps_agent.py`) as a template
3. Create the new agent file in `agents/src/soloquest_agents/agents/`
4. The agent must:
   - Define its node function with `AgentState` input/output
   - Use the LLM router (`llm/router.py`) for LLM calls
   - Log actions to the state's `actions_taken` list
   - Call Next.js API routes for all DB writes (via `tools/soloquest_api.py`)
   - Never write to the database directly
5. Register the agent in `graph.py` (add node + conditional edge from supervisor)
6. Add the agent's LLM preference to `llm/router.py`
7. Add a FastAPI endpoint in `server.py` if the agent has a dedicated trigger
8. Add the agent name to `AgentConfig` seed data
9. Update `.claude/skills/soloquest-game/SKILL.md` agent table

Agent to add: $ARGUMENTS
