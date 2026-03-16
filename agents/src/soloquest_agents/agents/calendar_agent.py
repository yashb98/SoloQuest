"""Calendar Awareness Agent — read calendar, adjust quest load for busy days."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback


async def calendar_node(state: AgentState) -> AgentState:
    """Analyze calendar events and adjust today's quest/todo recommendations."""
    event_data = state["event_data"]
    events = event_data.get("events", [])
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    if not events:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Analyze calendar with LLM
    messages = [
        SystemMessage(content="""You analyze a user's calendar to optimize their quest schedule.
Given calendar events, determine:
1. How busy the day is (light/moderate/heavy)
2. Any events that relate to quest categories (interview → jobs, gym → health, etc.)
3. Free time windows for deep work
Reply with JSON: {
  "busyness": "light" | "moderate" | "heavy",
  "quest_boosts": [{"category": "jobs", "reason": "interview at 2pm"}],
  "free_windows": [{"start": "09:00", "end": "12:00", "suggestion": "deep work on learning quests"}],
  "recommendation": "brief daily advice"
}"""),
        HumanMessage(content=f"Calendar events today: {json.dumps(events[:15])}"),
    ]

    response = await invoke_with_fallback("calendar_awareness", messages)

    try:
        analysis = json.loads(response.strip()) if response.strip().startswith("{") else {}
    except (json.JSONDecodeError, ValueError):
        analysis = {}

    busyness = analysis.get("busyness", "moderate")
    boosts = analysis.get("quest_boosts", [])
    recommendation = analysis.get("recommendation", "")

    actions.append({
        "type": "calendar_analysis",
        "agent": "calendar",
        "data": {
            "busyness": busyness,
            "events_count": len(events),
            "quest_boosts": boosts,
        },
        "reason": recommendation or f"Day is {busyness} with {len(events)} events",
        "undoable": False,
    })

    if busyness == "heavy":
        notifications.append({
            "title": "Busy day detected",
            "body": "Quest load lightened. Focus on quick wins between meetings.",
            "priority": "batched",
            "agent": "calendar",
        })
    elif boosts:
        boost = boosts[0]
        notifications.append({
            "title": f"Calendar boost: {boost['category']}",
            "body": boost.get("reason", "Relevant event detected — matching quests prioritized."),
            "priority": "batched",
            "agent": "calendar",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
