"""Main LangGraph supervisor graph for SoloQuest agent orchestration — 13 agents."""
import json
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage

from .state import AgentState
from .llm.router import invoke_with_fallback
from .tools import soloquest_api as api

# --- Import all 13 agent nodes ---
from .agents.steps_agent import steps_node
from .agents.expense_agent import expense_node
from .agents.sleep_agent import sleep_node
from .agents.todo_agent import todo_node
from .agents.streak_guardian import streak_guardian_node
from .agents.screen_time_agent import screen_time_node
from .agents.quest_agent import quest_node
from .agents.weekly_strategist import weekly_strategist_node
from .agents.daily_focus_agent import daily_focus_node
from .agents.notion_sync_agent import notion_sync_node
from .agents.adaptive_learning_agent import adaptive_learning_node
from .agents.calendar_agent import calendar_node
from .agents.social_accountability_agent import social_accountability_node

# All valid agent names
ALL_AGENTS = {
    "steps_agent", "screen_time_agent", "expense_agent", "todo_agent",
    "quest_agent", "streak_guardian", "sleep_agent", "weekly_strategist",
    "daily_focus", "notion_sync", "adaptive_learning", "calendar", "social_accountability",
}


# --- Supervisor: routes events to the correct agent ---
async def supervisor_node(state: AgentState) -> AgentState:
    """Supervisor decides which agent should handle the event."""
    event_type = state["event_type"]

    # Direct routing for known event types (no LLM needed)
    direct_routes = {
        "health_sync": "steps_agent",
        "screen_time_update": "screen_time_agent",
        "expense_notification": "expense_agent",
        "morning_plan": "todo_agent",
        "check_progress": "todo_agent",
        "evening_wrap": "todo_agent",
        "streak_check": "streak_guardian",
        "sleep_sync": "sleep_agent",
        "weekly_strategy": "weekly_strategist",
        "daily_focus": "daily_focus",
        "notion_sync": "notion_sync",
        "learning_check": "adaptive_learning",
        "calendar_sync": "calendar",
        "social_check": "social_accountability",
        "quest_optimization": "quest_agent",
    }

    if event_type in direct_routes:
        return {**state, "next_agent": direct_routes[event_type]}

    # For ambiguous events, use LLM to decide
    agents_list = ", ".join(sorted(ALL_AGENTS))
    messages = [
        SystemMessage(content=f"You are a routing supervisor. Pick the best agent for this event. Available: {agents_list}. Reply with ONLY the agent name."),
        HumanMessage(content=f"Event type: {event_type}\nData: {json.dumps(state['event_data'])[:500]}"),
    ]
    response = await invoke_with_fallback("supervisor", messages)
    agent = response.strip().lower().replace(" ", "_")

    if agent not in ALL_AGENTS:
        agent = "todo_agent"

    return {**state, "next_agent": agent}


# --- Context loader: fetches hunter + quests + todos before routing ---
async def load_context_node(state: AgentState) -> AgentState:
    """Load hunter context at the start of every graph run."""
    try:
        hunter = await api.get_hunter()
        quests = await api.get_quests()
        today = datetime.now().strftime("%Y-%m-%d")
        todos_response = await api.get_todos(today)
        todos = todos_response.get("todos", []) if isinstance(todos_response, dict) else []
    except Exception:
        hunter = {}
        quests = []
        todos = []

    return {
        **state,
        "hunter": hunter,
        "active_quests": quests,
        "today_todos": todos,
        "actions_taken": state.get("actions_taken", []),
        "notifications": state.get("notifications", []),
        "done": False,
    }


# --- Route from supervisor to the correct agent ---
def route_to_agent(state: AgentState) -> str:
    """Conditional edge: route to the agent chosen by supervisor."""
    agent = state.get("next_agent", "")
    if agent in ALL_AGENTS:
        return agent
    return END


# --- Build the graph ---
def build_graph() -> StateGraph:
    """Build the LangGraph supervisor graph with all 13 agents."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("load_context", load_context_node)
    graph.add_node("supervisor", supervisor_node)

    # Register all 13 agent nodes
    agent_nodes = {
        "steps_agent": steps_node,
        "screen_time_agent": screen_time_node,
        "expense_agent": expense_node,
        "todo_agent": todo_node,
        "quest_agent": quest_node,
        "streak_guardian": streak_guardian_node,
        "sleep_agent": sleep_node,
        "weekly_strategist": weekly_strategist_node,
        "daily_focus": daily_focus_node,
        "notion_sync": notion_sync_node,
        "adaptive_learning": adaptive_learning_node,
        "calendar": calendar_node,
        "social_accountability": social_accountability_node,
    }

    for name, node_fn in agent_nodes.items():
        graph.add_node(name, node_fn)

    # Edges
    graph.set_entry_point("load_context")
    graph.add_edge("load_context", "supervisor")
    graph.add_conditional_edges("supervisor", route_to_agent)

    # All agents go to END after running
    for name in agent_nodes:
        graph.add_edge(name, END)

    return graph.compile()


# Compiled graph singleton
agent_graph = build_graph()
