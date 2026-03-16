"""Todo Agent — auto-generate daily plans, reprioritize, carry over incomplete todos."""
import json
from datetime import datetime
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def todo_node(state: AgentState) -> AgentState:
    """Handle morning plan, mid-day check, and evening wrap-up."""
    event_data = state["event_data"]
    trigger = event_data.get("trigger", "periodic")
    hunter = state.get("hunter", {})
    quests = state.get("active_quests", [])
    todos = state.get("today_todos", [])
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))
    today = datetime.now().strftime("%Y-%m-%d")

    if trigger == "morning":
        # Generate today's plan from active quests + goals
        incomplete_quests = [q for q in quests if not q.get("isCompleted") and q.get("isActive")]
        quest_titles = [q["title"] for q in incomplete_quests[:10]]

        messages = [
            SystemMessage(content="""You are a daily planner AI. Generate 5-7 specific, actionable todos for today.
Base them on the active quests provided. Each todo should be concrete and completable in one sitting.
Reply with a JSON array: [{"title": "...", "category": "...", "priority": 0}]
Categories: health, learning, jobs, finance, focus, food, mental, agentiq, general.
Priority: 0=normal, 1=high, 2=critical."""),
            HumanMessage(content=f"Hunter: {hunter.get('hunterName', 'Hunter')} | Rank: {hunter.get('rank', 'E')}-{hunter.get('rankLevel', 1)} | Streak: {hunter.get('streak', 0)}d\nActive quests: {json.dumps(quest_titles)}\nExisting todos today: {len(todos)}"),
        ]

        response = await invoke_with_fallback("todo_agent", messages)

        try:
            new_todos = json.loads(response.strip()) if response.strip().startswith("[") else []
        except (json.JSONDecodeError, ValueError):
            new_todos = []

        created_count = 0
        for todo in new_todos[:7]:
            try:
                await api.create_todo(
                    title=todo.get("title", ""),
                    date=today,
                    category=todo.get("category", "general"),
                    priority=todo.get("priority", 0),
                )
                created_count += 1
            except Exception:
                pass

        if created_count > 0:
            actions.append({
                "type": "create_todos",
                "agent": "todo_agent",
                "data": {"count": created_count, "trigger": "morning_plan"},
                "reason": f"Generated {created_count} todos for today's plan",
                "undoable": False,
            })
            notifications.append({
                "title": f"Morning Plan Ready — {created_count} tasks",
                "body": "Your day is planned. Focus on what matters.",
                "priority": "immediate",
                "agent": "todo_agent",
            })

    elif trigger == "evening":
        # Carry over incomplete todos
        try:
            result = await api.carry_over_todos()
            carried = result.get("carried", 0)
            if carried > 0:
                actions.append({
                    "type": "carry_over",
                    "agent": "todo_agent",
                    "data": {"carried": carried},
                    "reason": f"Auto-carried {carried} incomplete todos to tomorrow",
                    "undoable": False,
                })
        except Exception:
            pass

        # Evening digest
        completed = len([t for t in todos if t.get("isCompleted")])
        total = len(todos)
        notifications.append({
            "title": f"Day Complete: {completed}/{total} todos done",
            "body": f"Streak: {hunter.get('streak', 0)}d | XP today: check dashboard",
            "priority": "digest",
            "agent": "todo_agent",
        })

    elif trigger == "periodic":
        # Mid-day check — count progress
        completed = len([t for t in todos if t.get("isCompleted")])
        total = len(todos)
        if total > 0 and completed < total // 2:
            hour = datetime.now().hour
            if hour >= 14:  # After 2pm and behind
                notifications.append({
                    "title": f"Behind pace: {completed}/{total} done",
                    "body": "Focus on high-priority items first.",
                    "priority": "batched",
                    "agent": "todo_agent",
                })

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
