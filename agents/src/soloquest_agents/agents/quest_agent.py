"""Quest Agent — curate daily quests, adaptive difficulty, chain progression."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def quest_node(state: AgentState) -> AgentState:
    """Curate and optimize the quest board based on stats, roadmap, and performance."""
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    # Gather context
    stats = {
        "vitality": hunter.get("vitality", 0),
        "intel": hunter.get("intel", 0),
        "hustle": hunter.get("hustle", 0),
        "wealth": hunter.get("wealth", 0),
        "focus": hunter.get("focus", 0),
        "agentIQ": hunter.get("agentIQ", 0),
    }
    weakest_stat = min(stats, key=stats.get)
    completed_today = len([q for q in quests if q.get("isCompleted")])
    total_active = len([q for q in quests if q.get("isActive") and not q.get("isCompleted")])

    try:
        goals = await api.get_goals()
        active_goals = [g for g in goals if not g.get("isCompleted")][:5]
    except Exception:
        active_goals = []

    messages = [
        SystemMessage(content="""You are a Quest Master AI for a gamified productivity app.
Analyze the hunter's stats, active quests, and goals to provide quest recommendations.
Reply with JSON: {
  "recommendations": ["suggestion 1", "suggestion 2"],
  "difficulty_adjustment": "maintain" | "increase" | "decrease",
  "focus_category": "health" | "learning" | "jobs" | "finance" | "focus" | "mental",
  "reason": "brief explanation"
}"""),
        HumanMessage(content=f"""Hunter: {hunter.get('hunterName', 'Hunter')} | Rank: {hunter.get('rank', 'E')}-{hunter.get('rankLevel', 1)}
Stats: {json.dumps(stats)}
Weakest stat: {weakest_stat} ({stats[weakest_stat]})
Streak: {hunter.get('streak', 0)}d
Completed today: {completed_today}/{completed_today + total_active}
Active goals: {json.dumps([g.get('title', '') for g in active_goals])}"""),
    ]

    response = await invoke_with_fallback("quest_agent", messages)

    try:
        analysis = json.loads(response.strip()) if response.strip().startswith("{") else {}
    except (json.JSONDecodeError, ValueError):
        analysis = {}

    recommendations = analysis.get("recommendations", [])
    difficulty = analysis.get("difficulty_adjustment", "maintain")
    focus_cat = analysis.get("focus_category", weakest_stat)

    if recommendations:
        actions.append({
            "type": "quest_analysis",
            "agent": "quest_agent",
            "data": {
                "recommendations": recommendations,
                "difficulty_adjustment": difficulty,
                "focus_category": focus_cat,
                "weakest_stat": weakest_stat,
            },
            "reason": analysis.get("reason", "Daily quest optimization"),
            "undoable": False,
        })

    if difficulty == "increase" and completed_today >= 5:
        notifications.append({
            "title": "Difficulty Increase Suggested",
            "body": f"You've crushed {completed_today} quests! Consider upgrading to Hard mode.",
            "priority": "batched",
            "agent": "quest_agent",
        })
    elif difficulty == "decrease":
        notifications.append({
            "title": "Take it easy today",
            "body": f"Focus on {focus_cat} quests — your {weakest_stat} needs attention.",
            "priority": "batched",
            "agent": "quest_agent",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
