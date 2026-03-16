"""Expense Agent — parse bank notifications and auto-log spending."""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from ..state import AgentState
from ..llm.router import invoke_with_fallback
from ..tools import soloquest_api as api


async def expense_node(state: AgentState) -> AgentState:
    """Parse a bank/payment notification and auto-log the expense."""
    event_data = state["event_data"]
    raw_text = event_data.get("rawText", "")
    app_name = event_data.get("appName", "")
    actions = list(state.get("actions_taken", []))
    notifications = list(state.get("notifications", []))

    if not raw_text:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Use Anthropic (complex text parsing) to extract expense details
    messages = [
        SystemMessage(content="""You parse bank/payment notification text into structured expense data.
Extract: amount (number), currency (default GBP), merchant name, and category.
Categories: food, transport, social, essentials, subscriptions, other.
Reply with ONLY a JSON object: {"amount": 12.50, "currency": "GBP", "merchant": "Tesco", "category": "food"}
If you cannot parse the notification, reply with: {"error": "unparseable"}"""),
        HumanMessage(content=f"App: {app_name}\nNotification: {raw_text}"),
    ]

    response = await invoke_with_fallback("expense_agent", messages)

    # Parse response
    try:
        cleaned = response.strip()
        if cleaned.startswith("{"):
            expense = json.loads(cleaned)
        else:
            return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
    except (json.JSONDecodeError, ValueError):
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    if "error" in expense:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    amount = expense.get("amount", 0)
    merchant = expense.get("merchant", "Unknown")
    category = expense.get("category", "other")

    if amount <= 0:
        return {**state, "actions_taken": actions, "notifications": notifications, "done": True}

    # Log the expense via API
    try:
        await api.log_spend(
            category=category,
            amount=amount,
            description=f"{merchant} ({app_name})",
        )

        gold_deducted = int(amount * 10)
        actions.append({
            "type": "log_expense",
            "agent": "expense_agent",
            "data": {"amount": amount, "merchant": merchant, "category": category, "gold_deducted": gold_deducted},
            "reason": f"Parsed from {app_name}: £{amount:.2f} at {merchant}",
            "undoable": True,
        })

        priority = "immediate" if amount > 50 else "batched"
        notifications.append({
            "title": f"£{amount:.2f} at {merchant}",
            "body": f"Auto-logged as {category} — -{gold_deducted}G",
            "priority": priority,
            "agent": "expense_agent",
        })
    except Exception:
        pass

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
