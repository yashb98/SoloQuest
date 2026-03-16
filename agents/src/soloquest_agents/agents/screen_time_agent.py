"""Screen Time Agent — update focus quest progress, penalize excess social media."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api

# Common social media apps
SOCIAL_APPS = {"instagram", "tiktok", "twitter", "x", "facebook", "snapchat", "reddit", "youtube"}
PRODUCTIVE_APPS = {"soloquest", "notion", "obsidian", "anki", "vscode", "xcode", "terminal", "slack", "linear"}


async def screen_time_node(state: AgentState) -> AgentState:
    """Update focus quest progress bars based on screen time data."""
    event_data = state["event_data"]
    total_minutes = event_data.get("totalMinutes", 0)
    app_breakdown = event_data.get("appBreakdown", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    # Classify apps (fast path — no LLM needed for known apps)
    social_minutes = 0
    productive_minutes = 0
    unknown_apps = []

    for app, mins in app_breakdown.items():
        app_lower = app.lower().replace(" ", "")
        if any(s in app_lower for s in SOCIAL_APPS):
            social_minutes += mins
        elif any(p in app_lower for p in PRODUCTIVE_APPS):
            productive_minutes += mins
        else:
            unknown_apps.append(app)

    # LLM classify unknowns only if there are any
    if unknown_apps:
        messages = [
            SystemMessage(content='Classify apps as "social" or "productive" or "neutral". Reply JSON: {"social":[],"productive":[],"neutral":[]}'),
            HumanMessage(content=f"Apps: {json.dumps(unknown_apps)}"),
        ]
        response = await invoke_with_fallback("screen_time_agent", messages)
        try:
            classification = json.loads(response.strip()) if response.strip().startswith("{") else {}
            for app in classification.get("social", []):
                social_minutes += app_breakdown.get(app, 0)
            for app in classification.get("productive", []):
                productive_minutes += app_breakdown.get(app, 0)
        except (json.JSONDecodeError, ValueError):
            pass

    # Update focus quest progress bars
    focus_quests = [
        q for q in quests
        if q.get("category") == "focus"
        and not q.get("isCompleted")
        and q.get("isActive")
    ]

    # Focus quests: progress = productive time vs target (e.g. "4 hours deep work")
    # Or inverse: less screen time = more progress for "limit screen time" quests
    for quest in focus_quests:
        title_lower = quest.get("title", "").lower()
        target = quest.get("progressTarget", 0)

        if any(w in title_lower for w in ["limit", "reduce", "less", "under"]):
            # Inverse quest: less screen time = more progress
            if target <= 0:
                target = 120  # default: under 2 hours
            # Progress is inverse: 0 min = 100%, target min = 0%
            current = max(0, target - total_minutes)
            try:
                result = await api.update_quest_progress(
                    quest_id=quest["id"],
                    progress_current=current,
                    progress_target=target,
                    progress_unit="min saved",
                )
                progress = result.get("quest", {}).get("progress", 0)
                actions.append({
                    "type": "update_progress",
                    "agent": "screen_time_agent",
                    "data": {"quest_id": quest["id"], "total_minutes": total_minutes, "progress": progress},
                    "reason": f"Screen time {total_minutes}min (target: <{target}min) — {progress}%",
                    "undoable": False,
                })
            except Exception:
                pass
        else:
            # Productive time quest: more productive time = more progress
            if target <= 0:
                target = 180  # default: 3 hours productive
            try:
                result = await api.update_quest_progress(
                    quest_id=quest["id"],
                    progress_current=productive_minutes,
                    progress_target=target,
                    progress_unit="min productive",
                )
                progress = result.get("quest", {}).get("progress", 0)
                auto_completed = result.get("autoCompleted", False)
                actions.append({
                    "type": "update_progress" if not auto_completed else "complete_quest",
                    "agent": "screen_time_agent",
                    "data": {"quest_id": quest["id"], "productive_minutes": productive_minutes, "progress": progress},
                    "reason": f"{productive_minutes}min productive / {target}min target — {progress}%",
                    "undoable": auto_completed,
                })
            except Exception:
                pass

    # Penalize excess social media (>60 min)
    if social_minutes > 60:
        penalty_gold = int((social_minutes - 60) * 0.5)
        if penalty_gold > 0:
            try:
                await api.create_penalty(
                    quest_title="Screen Time Excess",
                    gold_lost=penalty_gold,
                    reason="screen_time",
                    description=f"Social media: {social_minutes}min (limit: 60min)",
                )
                actions.append({
                    "type": "create_penalty",
                    "agent": "screen_time_agent",
                    "data": {"social_minutes": social_minutes, "gold_lost": penalty_gold},
                    "reason": f"Social media exceeded: {social_minutes}min (-{penalty_gold}G)",
                    "undoable": True,
                })
                notifications.append({
                    "title": f"Screen Penalty: -{penalty_gold}G",
                    "body": f"Social media: {social_minutes}min (limit: 60). Cut it for focus bonus!",
                    "priority": "batched",
                    "agent": "screen_time_agent",
                })
            except Exception:
                pass

    if productive_minutes > 120:
        notifications.append({
            "title": f"Deep work: {productive_minutes}min",
            "body": "Great focus session! Your focus stat thanks you.",
            "priority": "batched",
            "agent": "screen_time_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
