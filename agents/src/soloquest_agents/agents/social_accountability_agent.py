"""Social Accountability Agent — progress cards, milestone celebrations, motivation."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback


STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365]


async def social_accountability_node(state: AgentState) -> AgentState:
    """Generate motivational content and celebrate milestones."""
    hunter = state.get("hunter", {})
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    streak = hunter.get("streak", 0)
    rank = hunter.get("rank", "E")
    rank_level = hunter.get("rankLevel", 1)
    gold = hunter.get("gold", 0)

    # Check for streak milestones
    milestone_hit = streak in STREAK_MILESTONES

    if milestone_hit:
        messages = [
            SystemMessage(content="""Generate a short, dramatic celebration message for a streak milestone.
Channel the "System" from Solo Leveling — cold, acknowledging, powerful.
Keep it under 30 words. Reference the exact streak number."""),
            HumanMessage(content=f"Hunter: {hunter.get('hunterName', 'Hunter')} | Rank: {rank}-{rank_level} | Streak milestone: {streak} days"),
        ]

        response = await invoke_with_fallback("social_accountability", messages)
        celebration = response.strip() if response else f"Streak milestone: {streak} days. The System acknowledges your discipline."

        notifications.append({
            "title": f"🔥 {streak}-Day Streak!",
            "body": celebration,
            "priority": "immediate",
            "agent": "social_accountability",
        })

        actions.append({
            "type": "milestone_celebration",
            "agent": "social_accountability",
            "data": {"milestone": streak, "type": "streak"},
            "reason": f"{streak}-day streak milestone reached",
            "undoable": False,
        })
    else:
        # Daily motivation (if not a milestone day)
        messages = [
            SystemMessage(content="""Generate a brief motivational message for a gamified productivity app user.
Be specific to their stats. Under 20 words. Cold, direct, powerful — like the System from Solo Leveling."""),
            HumanMessage(content=f"Rank: {rank}-{rank_level} | Streak: {streak}d | Gold: {gold}"),
        ]

        response = await invoke_with_fallback("social_accountability", messages)
        motivation = response.strip() if response else ""

        if motivation:
            actions.append({
                "type": "daily_motivation",
                "agent": "social_accountability",
                "data": {"message": motivation},
                "reason": "Daily motivational check-in",
                "undoable": False,
            })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
