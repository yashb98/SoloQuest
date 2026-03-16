"""Notion/Notes Sync Agent — log expenses and daily journal to Notion."""
import json
from datetime import datetime
from ..state import AgentState
from ..config import NOTION_API_KEY, NOTION_DATABASE_ID

# Optional Notion SDK
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False


async def _create_notion_page(title: str, properties: dict) -> bool:
    """Create a page in the Notion expense database."""
    if not NOTION_API_KEY or not NOTION_DATABASE_ID or not HAS_HTTPX:
        return False

    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "https://api.notion.com/v1/pages",
                headers={
                    "Authorization": f"Bearer {NOTION_API_KEY}",
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28",
                },
                json={
                    "parent": {"database_id": NOTION_DATABASE_ID},
                    "properties": properties,
                },
                timeout=15.0,
            )
            return res.status_code == 200
        except Exception:
            return False


async def notion_sync_node(state: AgentState) -> AgentState:
    """Sync expense data and daily journal to Notion."""
    event_data = state["event_data"]
    hunter = state.get("hunter", {})
    actions_taken = state.get("actions_taken", [])
    actions = list(actions_taken)
    notifications = list(state.get("notifications", []))

    # Check what we need to sync
    trigger = event_data.get("trigger", "expense")
    today = datetime.now().strftime("%Y-%m-%d")

    if trigger == "expense":
        # Sync a single expense to Notion
        expense = event_data.get("expense", {})
        amount = expense.get("amount", 0)
        merchant = expense.get("merchant", "Unknown")
        category = expense.get("category", "other")
        gold_deducted = int(amount * 10)

        properties = {
            "Date": {"date": {"start": today}},
            "Amount": {"number": amount},
            "Merchant": {"title": [{"text": {"content": merchant}}]},
            "Category": {"select": {"name": category}},
            "Gold Deducted": {"number": gold_deducted},
        }

        synced = await _create_notion_page(f"£{amount} — {merchant}", properties)

        if synced:
            actions.append({
                "type": "notion_sync",
                "agent": "notion_sync",
                "data": {"synced": "expense", "amount": amount, "merchant": merchant},
                "reason": f"Synced £{amount} at {merchant} to Notion",
                "undoable": False,
            })

    elif trigger == "daily_journal":
        # Sync daily summary
        todos = state.get("today_todos", [])
        completed = len([t for t in todos if t.get("isCompleted")])
        total = len(todos)

        properties = {
            "Date": {"date": {"start": today}},
            "Merchant": {"title": [{"text": {"content": f"Daily Summary — {today}"}}]},
            "Category": {"select": {"name": "journal"}},
            "Amount": {"number": 0},
            "Gold Deducted": {"number": 0},
        }

        synced = await _create_notion_page(f"Journal — {today}", properties)

        if synced:
            actions.append({
                "type": "notion_sync",
                "agent": "notion_sync",
                "data": {"synced": "journal", "todos_completed": completed, "todos_total": total},
                "reason": f"Daily journal synced: {completed}/{total} todos",
                "undoable": False,
            })

    if not NOTION_API_KEY:
        # No Notion configured — skip silently
        pass

    return {**state, "actions_taken": actions, "notifications": notifications, "done": True}
