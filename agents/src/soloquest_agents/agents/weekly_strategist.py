"""Weekly Strategist Agent — Sunday reports, next-week planning, difficulty adjustment."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def weekly_strategist_node(state: AgentState) -> AgentState:
    """Generate weekly performance report and plan next week."""
    hunter = state.get("hunter", {})
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    stats = {
        "vitality": hunter.get("vitality", 0),
        "intel": hunter.get("intel", 0),
        "hustle": hunter.get("hustle", 0),
        "wealth": hunter.get("wealth", 0),
        "focus": hunter.get("focus", 0),
        "agentIQ": hunter.get("agentIQ", 0),
    }

    try:
        savings = await api.get_savings()
        monthly_spend = savings.get("monthlyTotal", 0)
    except Exception:
        monthly_spend = 0

    try:
        goals = await api.get_goals()
        active_goals = [g.get("title", "") for g in goals if not g.get("isCompleted")][:5]
    except Exception:
        active_goals = []

    messages = [
        SystemMessage(content="""You are a Weekly Strategist AI for a gamified productivity app.
Generate a concise weekly report and plan. Be specific and motivational.
Reply with JSON: {
  "report": {
    "highlights": ["achievement 1", "achievement 2"],
    "areas_to_improve": ["area 1"],
    "stat_focus_next_week": "stat_name",
    "spending_note": "brief note on spending"
  },
  "next_week_plan": {
    "priority_category": "category",
    "suggested_difficulty": "normal" | "hard",
    "key_goals": ["goal 1", "goal 2"],
    "daily_focus_suggestion": "what to focus on"
  },
  "motivation": "1-2 sentence motivational message referencing their actual progress"
}"""),
        HumanMessage(content=f"""Hunter: {hunter.get('hunterName', 'Hunter')} | {hunter.get('rank', 'E')}-{hunter.get('rankLevel', 1)}
Level: {hunter.get('level', 1)} | XP: {hunter.get('xp', 0)}/{hunter.get('xpToNext', 100)}
Gold: {hunter.get('gold', 0)} | Streak: {hunter.get('streak', 0)}d (best: {hunter.get('bestStreak', 0)})
Stats: {json.dumps(stats)}
Monthly spending: £{monthly_spend:.2f}
Active goals: {json.dumps(active_goals)}"""),
    ]

    response = await invoke_with_fallback("weekly_strategist", messages)

    try:
        report = json.loads(response.strip()) if response.strip().startswith("{") else {}
    except (json.JSONDecodeError, ValueError):
        report = {}

    if report:
        actions.append({
            "type": "weekly_report",
            "agent": "weekly_strategist",
            "data": report,
            "reason": "Weekly performance analysis and planning",
            "undoable": False,
        })

        motivation = report.get("motivation", "Keep pushing forward!")
        highlights = report.get("report", {}).get("highlights", [])
        highlight_text = highlights[0] if highlights else "Another week of progress"

        notifications.append({
            "title": "Weekly Report Ready",
            "body": f"{highlight_text}. {motivation}",
            "priority": "digest",
            "agent": "weekly_strategist",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
