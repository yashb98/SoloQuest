"""Shared state schema for the LangGraph agent system."""
from typing import TypedDict, Annotated
from langgraph.graph import add_messages


class AgentAction(TypedDict):
    """A single action taken by an agent."""
    type: str       # "complete_quest", "log_expense", "create_todo", "create_penalty", etc.
    agent: str      # Which agent took this action
    data: dict      # Action-specific data (quest_id, amount, etc.)
    reason: str     # Why the agent took this action
    undoable: bool  # Whether this action can be reversed


class Notification(TypedDict):
    """A push notification to send to the mobile app."""
    title: str
    body: str
    priority: str   # "immediate", "batched", "digest"
    agent: str      # Which agent generated this


class AgentState(TypedDict):
    """Shared state passed through the LangGraph graph."""
    # Incoming event
    event_type: str         # "health_sync", "screen_time_update", "notification", etc.
    event_data: dict        # Raw data from mobile/cron

    # Hunter context (fetched at graph entry)
    hunter: dict            # Full hunter profile from /api/hunter
    active_quests: list     # Today's active quests from /api/quests
    today_todos: list       # Today's todos from /api/todos

    # LLM conversation history
    messages: Annotated[list, add_messages]

    # Agent outputs
    actions_taken: list     # List of AgentAction dicts
    notifications: list     # List of Notification dicts

    # Routing control
    next_agent: str         # Supervisor sets this to route to a specific agent
    done: bool              # Set to True when processing is complete
