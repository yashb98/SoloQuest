"""Steps Agent — update health quest progress bars from step count (HealthKit/Google Fit)."""
import json
from ..state import AgentState
from ..tools import soloquest_api as api


# Step thresholds for common quest titles
STEP_TARGETS = {
    "walk": 8000,
    "step": 10000,
    "10k": 10000,
    "10,000": 10000,
    "8k": 8000,
    "8,000": 8000,
    "5k": 5000,
    "5,000": 5000,
    "15k": 15000,
    "15,000": 15000,
}


def _guess_step_target(title: str) -> int:
    """Guess the step target from quest title."""
    lower = title.lower()
    for keyword, target in STEP_TARGETS.items():
        if keyword in lower:
            return target
    # Default: if it mentions steps/walk, assume 8000
    if any(w in lower for w in ["step", "walk", "hike", "run"]):
        return 8000
    return 0


async def steps_node(state: AgentState) -> AgentState:
    """Update health quest progress bars with current step count."""
    event_data = state["event_data"]
    steps = event_data.get("steps", 0)
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    # Filter active, incomplete health quests
    health_quests = [
        q for q in quests
        if q.get("category") == "health"
        and not q.get("isCompleted")
        and q.get("isActive")
    ]

    if not health_quests or steps <= 0:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    for quest in health_quests:
        target = quest.get("progressTarget", 0)
        if target <= 0:
            target = _guess_step_target(quest["title"])
        if target <= 0:
            continue

        try:
            result = await api.update_quest_progress(
                quest_id=quest["id"],
                progress_current=steps,
                progress_target=target,
                progress_unit="steps",
            )

            auto_completed = result.get("autoCompleted", False)
            updated = result.get("quest", {})
            progress = updated.get("progress", 0)

            actions.append({
                "type": "update_progress" if not auto_completed else "complete_quest",
                "agent": "steps_agent",
                "data": {
                    "quest_id": quest["id"],
                    "quest_title": quest["title"],
                    "steps": steps,
                    "target": target,
                    "progress": progress,
                    "auto_completed": auto_completed,
                },
                "reason": f"{steps:,}/{target:,} steps ({progress}%) for '{quest['title']}'",
                "undoable": auto_completed,
            })

            if auto_completed:
                rewards = result.get("rewards", {})
                notifications.append({
                    "title": f"Quest Complete: {quest['title']}",
                    "body": f"{steps:,} steps! +{rewards.get('xp', 0)} XP, +{rewards.get('gold', 0)}g",
                    "priority": "immediate",
                    "agent": "steps_agent",
                })
        except Exception:
            pass

    # Nudge if no quest hit 100%
    any_completed = any(a.get("data", {}).get("auto_completed") for a in actions)
    if not any_completed and steps < 8000:
        remaining = 8000 - steps
        walk_min = remaining // 130
        notifications.append({
            "title": f"{remaining:,} steps to go",
            "body": f"A {walk_min} min walk would do it!",
            "priority": "batched",
            "agent": "steps_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
