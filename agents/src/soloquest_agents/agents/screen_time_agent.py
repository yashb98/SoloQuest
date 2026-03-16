"""Screen Time Agent — auto-complete focus quests, penalize excess social media."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def screen_time_node(state: AgentState) -> AgentState:
    """Process screen time data and auto-manage focus quests."""
    event_data = state["event_data"]
    total_minutes = event_data.get("totalMinutes", 0)
    app_breakdown = event_data.get("appBreakdown", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    # Classify apps into productive/social/neutral
    messages = [
        SystemMessage(content="""Classify these apps into categories: productive, social, neutral.
Reply with JSON: {"productive": ["app1"], "social": ["app2"], "neutral": ["app3"]}"""),
        HumanMessage(content=f"Apps: {json.dumps(list(app_breakdown.keys()))}"),
    ]

    response = await invoke_with_fallback("screen_time_agent", messages)
    try:
        classification = json.loads(response.strip()) if response.strip().startswith("{") else {}
    except (json.JSONDecodeError, ValueError):
        classification = {}

    social_apps = classification.get("social", [])
    productive_apps = classification.get("productive", [])

    social_minutes = sum(app_breakdown.get(app, 0) for app in social_apps)
    productive_minutes = sum(app_breakdown.get(app, 0) for app in productive_apps)

    # Auto-complete focus quests if screen time is low
    focus_quests = [
        q for q in quests
        if q.get("category") == "focus"
        and not q.get("isCompleted")
        and q.get("isActive")
    ]

    if total_minutes < 120 and focus_quests:  # Less than 2 hours total
        for quest in focus_quests[:1]:  # Complete the first focus quest
            try:
                result = await api.complete_quest(quest["id"], notes=f"Screen time {total_minutes}min — auto-completed by Screen Time Agent")
                actions.append({
                    "type": "complete_quest",
                    "agent": "screen_time_agent",
                    "data": {"quest_id": quest["id"], "total_minutes": total_minutes},
                    "reason": f"Low screen time ({total_minutes}min) qualifies",
                    "undoable": True,
                })
            except Exception:
                pass

    # Penalize excess social media (>60 min)
    if social_minutes > 60:
        penalty_gold = int((social_minutes - 60) * 0.5)  # 0.5 gold per excess minute
        if penalty_gold > 0:
            try:
                await api.create_penalty(
                    quest_title="Screen Time Excess",
                    gold_lost=penalty_gold,
                    reason="screen_time",
                    description=f"Social media: {social_minutes}min (limit: 60min) — {', '.join(social_apps[:3])}",
                )
                actions.append({
                    "type": "create_penalty",
                    "agent": "screen_time_agent",
                    "data": {"social_minutes": social_minutes, "gold_lost": penalty_gold},
                    "reason": f"Social media exceeded limit: {social_minutes}min",
                    "undoable": True,
                })
                notifications.append({
                    "title": f"Screen Time Penalty: -{penalty_gold}G",
                    "body": f"Social media: {social_minutes}min (limit: 60). Reduce for focus bonus!",
                    "priority": "batched",
                    "agent": "screen_time_agent",
                })
            except Exception:
                pass

    # Reward productive screen time
    if productive_minutes > 120:
        notifications.append({
            "title": f"Productive screen time: {productive_minutes}min",
            "body": "Great focus! Keep it up.",
            "priority": "batched",
            "agent": "screen_time_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
