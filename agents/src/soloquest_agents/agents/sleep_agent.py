"""Sleep Agent — auto-complete sleep quests, trigger recovery mode on bad sleep."""
from ..state import AgentState
from ..tools import soloquest_api as api


async def sleep_node(state: AgentState) -> AgentState:
    """Process sleep data and auto-complete matching health quests."""
    event_data = state["event_data"]
    sleep_hours = event_data.get("sleepHours", 0)
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    if sleep_hours <= 0:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Auto-complete sleep quests if good sleep (>7.5 hrs)
    if sleep_hours >= 7.5:
        sleep_quests = [
            q for q in quests
            if q.get("category") == "health"
            and not q.get("isCompleted")
            and q.get("isActive")
            and "sleep" in q.get("title", "").lower()
        ]

        for quest in sleep_quests:
            try:
                result = await api.complete_quest(
                    quest["id"],
                    notes=f"Auto-completed by Sleep Agent: {sleep_hours:.1f} hours sleep",
                )
                actions.append({
                    "type": "complete_quest",
                    "agent": "sleep_agent",
                    "data": {"quest_id": quest["id"], "quest_title": quest["title"], "sleep_hours": sleep_hours},
                    "reason": f"{sleep_hours:.1f}h sleep meets requirement",
                    "undoable": True,
                })
                notifications.append({
                    "title": f"Great sleep! {sleep_hours:.1f}h",
                    "body": f"'{quest['title']}' auto-completed +{result.get('xpEarned', 0)} XP",
                    "priority": "batched",
                    "agent": "sleep_agent",
                })
            except Exception:
                pass

    # Poor sleep — recovery mode
    elif sleep_hours < 6:
        notifications.append({
            "title": f"Recovery Mode: {sleep_hours:.1f}h sleep",
            "body": "Today's quest load reduced. Focus on rest and easy wins.",
            "priority": "immediate",
            "agent": "sleep_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
