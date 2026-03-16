"""Daily Focus Agent — morning "what's your focus?" → reshuffle quests/todos for the day."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def daily_focus_node(state: AgentState) -> AgentState:
    """Reshuffle today's quests and todos based on user's chosen focus."""
    event_data = state["event_data"]
    focus = event_data.get("focus", "")
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    todos = state.get("today_todos", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))
    date = event_data.get("date", "")

    stats = {
        "vitality": hunter.get("vitality", 0),
        "intel": hunter.get("intel", 0),
        "hustle": hunter.get("hustle", 0),
        "wealth": hunter.get("wealth", 0),
        "focus": hunter.get("focus", 0),
        "agentIQ": hunter.get("agentIQ", 0),
    }

    # If no focus provided, auto-pick based on weakest stat + roadmap
    if not focus:
        weakest = min(stats, key=stats.get)
        stat_to_category = {
            "vitality": "health", "intel": "learning", "hustle": "jobs",
            "wealth": "finance", "focus": "focus", "agentIQ": "agentiq",
        }
        focus = stat_to_category.get(weakest, "learning")

    # Category mapping
    focus_categories = {
        "job_hunting": "jobs", "jobs": "jobs",
        "learning": "learning", "study": "learning",
        "health": "health", "fitness": "health",
        "finance": "finance", "money": "finance",
        "agentiq": "agentiq", "ai": "agentiq",
        "focus": "focus", "deep_work": "focus",
        "rest": "mental", "rest_day": "mental", "mental": "mental",
    }
    category = focus_categories.get(focus.lower().replace(" ", "_"), focus.lower())

    # Generate targeted todos for today's focus
    messages = [
        SystemMessage(content=f"""You are a daily planner. Today's focus is: {category}.
Generate 2-3 specific, actionable todos for this focus area.
Reply with JSON array: [{{"title": "...", "category": "{category}", "priority": 1}}]"""),
        HumanMessage(content=f"Hunter: {hunter.get('hunterName', 'Hunter')} | Rank: {hunter.get('rank', 'E')}-{hunter.get('rankLevel', 1)} | Streak: {hunter.get('streak', 0)}d\nExisting todos: {len(todos)}"),
    ]

    response = await invoke_with_fallback("daily_focus", messages)

    try:
        new_todos = json.loads(response.strip()) if response.strip().startswith("[") else []
    except (json.JSONDecodeError, ValueError):
        new_todos = []

    created = 0
    for todo in new_todos[:3]:
        try:
            await api.create_todo(
                title=todo.get("title", ""),
                date=date,
                category=todo.get("category", category),
                priority=todo.get("priority", 1),
            )
            created += 1
        except Exception:
            pass

    # Count focus-area quests
    focus_quests = len([q for q in quests if q.get("category") == category and not q.get("isCompleted")])
    rest_mode = category == "mental"

    actions.append({
        "type": "set_daily_focus",
        "agent": "daily_focus",
        "data": {
            "focus": focus,
            "category": category,
            "todos_created": created,
            "focus_quests_available": focus_quests,
            "rest_mode": rest_mode,
        },
        "reason": f"Daily focus set to '{focus}' — {created} todos created, {focus_quests} matching quests",
        "undoable": False,
    })

    if rest_mode:
        notifications.append({
            "title": "Rest Day Mode",
            "body": "Lighter load today. Focus on mental health and recovery.",
            "priority": "immediate",
            "agent": "daily_focus",
        })
    else:
        notifications.append({
            "title": f"Focus: {focus.replace('_', ' ').title()}",
            "body": f"{created} new todos + {focus_quests} quests aligned. Let's go!",
            "priority": "immediate",
            "agent": "daily_focus",
        })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
