"""Steps Agent — auto-complete health quests based on step count from HealthKit/Google Fit."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def steps_node(state: AgentState) -> AgentState:
    """Process step count data and auto-complete matching health quests."""
    event_data = state["event_data"]
    steps = event_data.get("steps", 0)
    active_minutes = event_data.get("activeMinutes", 0)
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    # Filter health quests that aren't completed
    health_quests = [
        q for q in quests
        if q.get("category") == "health"
        and not q.get("isCompleted")
        and q.get("isActive")
    ]

    if not health_quests:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Use LLM to match step count against quest requirements
    quest_titles = [{"id": q["id"], "title": q["title"]} for q in health_quests]
    messages = [
        SystemMessage(content="""You match step count and activity data against health quest requirements.
Given step count and active minutes, determine which quests are completed.
Reply with a JSON array of quest IDs that should be auto-completed.
Only include quests where the data clearly meets the requirement.
Example: [5, 12] or [] if none match."""),
        HumanMessage(content=f"Steps today: {steps}\nActive minutes: {active_minutes}\nHealth quests: {json.dumps(quest_titles)}"),
    ]

    response = await invoke_with_fallback("steps_agent", messages)

    # Parse completed quest IDs
    completed_ids = []
    try:
        cleaned = response.strip()
        if cleaned.startswith("["):
            completed_ids = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        pass

    # Auto-complete matched quests
    for quest_id in completed_ids:
        quest = next((q for q in health_quests if q["id"] == quest_id), None)
        if not quest:
            continue

        try:
            result = await api.complete_quest(quest_id, notes=f"Auto-completed by Steps Agent: {steps} steps")
            actions.append({
                "type": "complete_quest",
                "agent": "steps_agent",
                "data": {"quest_id": quest_id, "quest_title": quest["title"], "steps": steps, "xp_earned": result.get("xpEarned", 0)},
                "reason": f"{steps} steps meets requirement for '{quest['title']}'",
                "undoable": True,
            })
            notifications.append({
                "title": f"Quest Completed: {quest['title']}",
                "body": f"Steps Agent auto-completed — {steps} steps today! +{result.get('xpEarned', 0)} XP",
                "priority": "immediate",
                "agent": "steps_agent",
            })
        except Exception:
            pass  # Graceful degradation

    # Nudge if step goal not met and it's getting late
    if not completed_ids and steps < 8000:
        remaining = 8000 - steps
        walk_min = remaining // 130  # ~130 steps per minute walking
        notifications.append({
            "title": f"{remaining:,} steps to go",
            "body": f"A {walk_min} min walk would do it!",
            "priority": "batched",
            "agent": "steps_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
