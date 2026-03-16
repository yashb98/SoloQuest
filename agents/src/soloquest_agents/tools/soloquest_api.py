"""HTTP client for calling the SoloQuest Next.js API."""
import httpx
from ..config import SOLOQUEST_API_URL, SOLOQUEST_API_TOKEN


def _headers() -> dict:
    h = {"Content-Type": "application/json"}
    if SOLOQUEST_API_TOKEN:
        h["Authorization"] = f"Bearer {SOLOQUEST_API_TOKEN}"
    return h


_client = httpx.AsyncClient(base_url=SOLOQUEST_API_URL, headers=_headers(), timeout=30.0)


async def get_hunter() -> dict:
    res = await _client.get("/api/hunter")
    res.raise_for_status()
    return res.json()


async def get_quests() -> list:
    res = await _client.get("/api/quests")
    res.raise_for_status()
    return res.json()


async def complete_quest(quest_id: int, notes: str = "") -> dict:
    res = await _client.post("/api/quests/complete", json={"questId": quest_id, "notes": notes})
    res.raise_for_status()
    return res.json()


async def undo_quest(quest_id: int) -> dict:
    res = await _client.post("/api/quests/complete", json={"questId": quest_id, "undo": True})
    res.raise_for_status()
    return res.json()


async def get_todos(date: str) -> dict:
    res = await _client.get(f"/api/todos?date={date}")
    res.raise_for_status()
    return res.json()


async def create_todo(title: str, date: str, category: str = "general", priority: int = 0) -> dict:
    res = await _client.post("/api/todos", json={
        "action": "create", "title": title, "date": date,
        "category": category, "priority": priority,
    })
    res.raise_for_status()
    return res.json()


async def toggle_todo(todo_id: int) -> dict:
    res = await _client.post("/api/todos", json={"action": "toggle", "todoId": todo_id})
    res.raise_for_status()
    return res.json()


async def carry_over_todos() -> dict:
    res = await _client.post("/api/todos", json={"action": "carry_over"})
    res.raise_for_status()
    return res.json()


async def log_spend(category: str, amount: float, description: str) -> dict:
    res = await _client.post("/api/savings", json={
        "type": "spend", "category": category,
        "amount": amount, "description": description,
    })
    res.raise_for_status()
    return res.json()


async def create_penalty(quest_title: str, gold_lost: int, reason: str, description: str) -> dict:
    res = await _client.post("/api/penalties", json={
        "questTitle": quest_title, "goldLost": gold_lost,
        "reason": reason, "description": description,
    })
    res.raise_for_status()
    return res.json()


async def log_agent_run(agent_name: str, event_type: str, input_data: dict,
                         output_data: dict, status: str = "success",
                         duration_ms: int = 0, trace_id: str | None = None) -> dict:
    res = await _client.post("/api/agent-runs", json={
        "agentName": agent_name, "eventType": event_type,
        "input": input_data, "output": output_data,
        "status": status, "durationMs": duration_ms, "traceId": trace_id,
    })
    res.raise_for_status()
    return res.json()


async def push_device_data(data_type: str, value: str, date: str) -> dict:
    res = await _client.post("/api/device-data", json={
        "dataType": data_type, "value": value, "date": date,
    })
    res.raise_for_status()
    return res.json()


async def get_agent_configs() -> list:
    res = await _client.get("/api/agent-config")
    res.raise_for_status()
    return res.json()


async def get_goals() -> list:
    res = await _client.get("/api/goals")
    res.raise_for_status()
    return res.json()


async def get_savings() -> dict:
    res = await _client.get("/api/savings")
    res.raise_for_status()
    return res.json()


async def check_achievements() -> dict:
    res = await _client.post("/api/achievements/check")
    res.raise_for_status()
    return res.json()


async def update_quest_progress(quest_id: int, progress_current: float,
                                 progress_target: float | None = None,
                                 progress_unit: str | None = None) -> dict:
    """Update quest progress bar. Auto-completes if autoComplete is enabled and hits 100%."""
    data: dict = {"questId": quest_id, "progressCurrent": progress_current}
    if progress_target is not None:
        data["progressTarget"] = progress_target
    if progress_unit is not None:
        data["progressUnit"] = progress_unit
    res = await _client.post("/api/quests/progress", json=data)
    res.raise_for_status()
    return res.json()


async def update_todo_progress(todo_id: int, progress_current: float,
                                progress_target: float | None = None,
                                progress_unit: str | None = None) -> dict:
    """Update todo progress bar. Auto-completes if autoComplete is enabled and hits 100%."""
    data: dict = {"todoId": todo_id, "progressCurrent": progress_current}
    if progress_target is not None:
        data["progressTarget"] = progress_target
    if progress_unit is not None:
        data["progressUnit"] = progress_unit
    res = await _client.post("/api/todos/progress", json=data)
    res.raise_for_status()
    return res.json()
