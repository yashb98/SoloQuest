"""Streak Guardian Agent — protect streaks with timely warnings and auto-shield application."""
from datetime import datetime
from ..state import AgentState
from ..tools import soloquest_api as api


async def streak_guardian_node(state: AgentState) -> AgentState:
    """Check streak status and warn if at risk."""
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    streak = hunter.get("streak", 0)
    if streak == 0:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Check if any quest completed today
    completed_today = any(q.get("isCompleted") for q in quests)

    if completed_today:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # No quest completed — streak at risk
    hour = datetime.now().hour

    if hour >= 22:
        # Critical — less than 2 hours to midnight
        # Find the easiest quest
        easy_quests = sorted(
            [q for q in quests if not q.get("isCompleted") and q.get("isActive")],
            key=lambda q: q.get("xpBase", 0),
        )
        easiest = easy_quests[0] if easy_quests else None

        if easiest:
            notifications.append({
                "title": f"STREAK AT RISK! {streak}d streak",
                "body": f"Quick win: '{easiest['title']}' — just complete it!",
                "priority": "immediate",
                "agent": "streak_guardian",
            })
        else:
            # No quests available — try to auto-apply shield
            shields = hunter.get("streakShields", 0)
            if shields > 0:
                actions.append({
                    "type": "apply_shield",
                    "agent": "streak_guardian",
                    "data": {"shields_remaining": shields - 1, "streak": streak},
                    "reason": f"Auto-applied streak shield to protect {streak}d streak",
                    "undoable": True,
                })
                notifications.append({
                    "title": f"Streak Shield Applied",
                    "body": f"{streak}d streak protected! {shields - 1} shields remaining.",
                    "priority": "immediate",
                    "agent": "streak_guardian",
                })

    elif hour >= 20:
        # Warning — 8pm+
        notifications.append({
            "title": f"Streak warning: {streak}d",
            "body": "Complete 1 quest before midnight to keep your streak!",
            "priority": "immediate",
            "agent": "streak_guardian",
        })

    elif hour >= 18:
        # Gentle nudge — 6pm+
        notifications.append({
            "title": f"Don't forget your streak ({streak}d)",
            "body": "No quests completed yet today.",
            "priority": "batched",
            "agent": "streak_guardian",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
