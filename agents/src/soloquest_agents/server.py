"""FastAPI server for the SoloQuest agent backend."""
import time
import json
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .graph import agent_graph
from .state import AgentState
from .tools import soloquest_api as api
from .config import LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST


# --- Langfuse setup ---
langfuse_handler = None
if LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY:
    try:
        from langfuse.callback import CallbackHandler
        langfuse_handler = CallbackHandler(
            public_key=LANGFUSE_PUBLIC_KEY,
            secret_key=LANGFUSE_SECRET_KEY,
            host=LANGFUSE_HOST,
        )
    except ImportError:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup/shutdown."""
    yield


app = FastAPI(
    title="SoloQuest Agent Backend",
    description="13 AI agents for autonomous productivity tracking",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper: run the agent graph ---
async def run_agent(event_type: str, event_data: dict) -> dict:
    """Run the LangGraph agent graph with an event."""
    start = time.time()

    initial_state: AgentState = {
        "event_type": event_type,
        "event_data": event_data,
        "hunter": {},
        "active_quests": [],
        "today_todos": [],
        "messages": [],
        "actions_taken": [],
        "notifications": [],
        "next_agent": "",
        "done": False,
    }

    config = {}
    if langfuse_handler:
        config["callbacks"] = [langfuse_handler]

    try:
        result = await agent_graph.ainvoke(initial_state, config=config)
        duration_ms = int((time.time() - start) * 1000)

        # Log the agent run
        agent_name = result.get("next_agent", "unknown")
        trace_id = None
        if langfuse_handler and hasattr(langfuse_handler, "trace_id"):
            trace_id = langfuse_handler.trace_id

        await api.log_agent_run(
            agent_name=agent_name,
            event_type=event_type,
            input_data=event_data,
            output_data={
                "actions": result.get("actions_taken", []),
                "notifications": result.get("notifications", []),
            },
            status="success",
            duration_ms=duration_ms,
            trace_id=trace_id,
        )

        return {
            "success": True,
            "agent": agent_name,
            "actions": result.get("actions_taken", []),
            "notifications": result.get("notifications", []),
            "duration_ms": duration_ms,
        }
    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        await api.log_agent_run(
            agent_name="error",
            event_type=event_type,
            input_data=event_data,
            output_data={"error": str(e)},
            status="error",
            duration_ms=duration_ms,
        )
        raise HTTPException(status_code=500, detail=str(e))


# --- Event-driven endpoints (called by mobile) ---

class HealthSyncRequest(BaseModel):
    steps: int = 0
    calories: int = 0
    activeMinutes: int = 0
    sleepHours: float = 0
    date: str = ""

@app.post("/agents/health-sync")
async def health_sync(req: HealthSyncRequest):
    date = req.date or datetime.now().strftime("%Y-%m-%d")
    data = req.model_dump()
    data["date"] = date

    # Store raw device data
    await api.push_device_data("steps", json.dumps(data), date)

    # If sleep data included, run sleep agent too
    if req.sleepHours > 0:
        await run_agent("sleep_sync", {"sleepHours": req.sleepHours, "date": date})

    return await run_agent("health_sync", data)


class ScreenTimeRequest(BaseModel):
    totalMinutes: int = 0
    appBreakdown: dict = {}
    date: str = ""

@app.post("/agents/screen-time-update")
async def screen_time_update(req: ScreenTimeRequest):
    date = req.date or datetime.now().strftime("%Y-%m-%d")
    data = req.model_dump()
    data["date"] = date
    await api.push_device_data("screen_time", json.dumps(data), date)
    return await run_agent("screen_time_update", data)


class ExpenseNotificationRequest(BaseModel):
    rawText: str
    appName: str = ""
    timestamp: str = ""

@app.post("/agents/expense-notification")
async def expense_notification(req: ExpenseNotificationRequest):
    date = datetime.now().strftime("%Y-%m-%d")
    data = req.model_dump()
    await api.push_device_data("notification", json.dumps(data), date)
    return await run_agent("expense_notification", data)


# --- Scheduled endpoints (called by cron or mobile on app open) ---

@app.post("/agents/morning-plan")
async def morning_plan():
    return await run_agent("morning_plan", {"trigger": "morning", "date": datetime.now().strftime("%Y-%m-%d")})

@app.post("/agents/check-progress")
async def check_progress():
    return await run_agent("check_progress", {"trigger": "periodic", "date": datetime.now().strftime("%Y-%m-%d")})

@app.post("/agents/evening-wrap")
async def evening_wrap():
    return await run_agent("evening_wrap", {"trigger": "evening", "date": datetime.now().strftime("%Y-%m-%d")})

@app.post("/agents/weekly-strategy")
async def weekly_strategy():
    return await run_agent("weekly_strategy", {"trigger": "weekly", "date": datetime.now().strftime("%Y-%m-%d")})


# --- Interactive endpoints ---

class DailyFocusRequest(BaseModel):
    focus: str = ""  # Empty = auto-pick

@app.post("/agents/daily-focus")
async def daily_focus(req: DailyFocusRequest):
    return await run_agent("daily_focus", {"focus": req.focus, "date": datetime.now().strftime("%Y-%m-%d")})


# --- Management endpoints ---

@app.get("/agents/status")
async def agent_status():
    """Get health check and last run time per agent."""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/agents/actions")
async def agent_actions(limit: int = 50):
    """Get recent agent actions."""
    return await api.get_agent_configs()  # TODO: return agent runs

@app.get("/")
async def root():
    return {"service": "SoloQuest Agent Backend", "version": "0.1.0", "agents": 13}
