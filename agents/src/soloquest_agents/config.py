"""Configuration and environment variables for the agent backend."""
import os
from dotenv import load_dotenv

load_dotenv()

# SoloQuest API
SOLOQUEST_API_URL = os.getenv("SOLOQUEST_API_URL", "http://localhost:3000")
SOLOQUEST_API_TOKEN = os.getenv("SOLOQUEST_API_TOKEN", "")

# LLM Providers
KIMI_API_KEY = os.getenv("KIMI_API_KEY", "")
KIMI_BASE_URL = os.getenv("KIMI_BASE_URL", "https://api.kimi.ai/v1")
KIMI_MODEL = os.getenv("KIMI_MODEL", "kimi")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# Langfuse Observability
LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")

# Notion Integration (optional)
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")

# Agent-to-LLM routing
LLM_ROUTING: dict[str, str] = {
    "supervisor": "kimi",
    "steps_agent": "kimi",
    "screen_time_agent": "kimi",
    "expense_agent": "anthropic",
    "todo_agent": "kimi",
    "quest_agent": "anthropic",
    "streak_guardian": "kimi",
    "sleep_agent": "kimi",
    "weekly_strategist": "anthropic",
    "daily_focus": "kimi",
    "notion_sync": "kimi",
    "adaptive_learning": "anthropic",
    "calendar_awareness": "kimi",
    "social_accountability": "anthropic",
}
