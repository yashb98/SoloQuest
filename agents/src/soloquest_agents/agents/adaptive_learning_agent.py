"""Adaptive Learning Agent — detect knowledge gaps, generate micro-learning todos."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def adaptive_learning_node(state: AgentState) -> AgentState:
    """Analyze learning progress and generate targeted micro-learning tasks."""
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))
    date = state["event_data"].get("date", "")

    # Gather learning context
    learning_quests = [q for q in quests if q.get("category") == "learning"]
    completed_learning = [q for q in learning_quests if q.get("isCompleted")]
    intel_stat = hunter.get("intel", 0)

    try:
        goals = await api.get_goals()
        learning_goals = [g for g in goals if "learn" in g.get("title", "").lower() or "study" in g.get("title", "").lower()]
    except Exception:
        learning_goals = []

    messages = [
        SystemMessage(content="""You are an Adaptive Learning AI. Analyze the hunter's learning progress and generate micro-learning tasks.
Consider:
- What topics they're working on (from quest titles)
- Their Intelligence stat level
- Active learning goals
Reply with JSON: {
  "knowledge_gaps": ["topic 1"],
  "micro_tasks": [{"title": "Read 1 article about X", "category": "learning", "priority": 0}],
  "pacing": "on_track" | "ahead" | "behind",
  "recommendation": "brief advice"
}"""),
        HumanMessage(content=f"""Hunter: {hunter.get('hunterName', 'Hunter')} | Intel stat: {intel_stat}
Learning quests completed today: {len(completed_learning)}/{len(learning_quests)}
Quest titles: {json.dumps([q['title'] for q in learning_quests[:10]])}
Learning goals: {json.dumps([g.get('title', '') for g in learning_goals[:5]])}"""),
    ]

    response = await invoke_with_fallback("adaptive_learning", messages)

    try:
        analysis = json.loads(response.strip()) if response.strip().startswith("{") else {}
    except (json.JSONDecodeError, ValueError):
        analysis = {}

    micro_tasks = analysis.get("micro_tasks", [])
    created = 0
    for task in micro_tasks[:3]:
        try:
            await api.create_todo(
                title=task.get("title", ""),
                date=date,
                category="learning",
                priority=task.get("priority", 0),
            )
            created += 1
        except Exception:
            pass

    if created > 0 or analysis.get("knowledge_gaps"):
        actions.append({
            "type": "learning_analysis",
            "agent": "adaptive_learning",
            "data": {
                "gaps": analysis.get("knowledge_gaps", []),
                "pacing": analysis.get("pacing", "unknown"),
                "todos_created": created,
            },
            "reason": analysis.get("recommendation", "Learning progress check"),
            "undoable": False,
        })

    pacing = analysis.get("pacing", "")
    if pacing == "behind":
        notifications.append({
            "title": "Learning pace: falling behind",
            "body": analysis.get("recommendation", "Spend 15 min on a micro-learning task today."),
            "priority": "batched",
            "agent": "adaptive_learning",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
