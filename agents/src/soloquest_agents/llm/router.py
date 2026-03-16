"""LLM routing — pick the right model for each agent task."""
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from ..config import (
    KIMI_API_KEY, KIMI_BASE_URL, KIMI_MODEL,
    ANTHROPIC_API_KEY, ANTHROPIC_MODEL,
    LLM_ROUTING,
)


def get_llm(agent_name: str, fallback: bool = False):
    """Get the appropriate LLM for a given agent.

    Args:
        agent_name: The agent requesting an LLM
        fallback: If True, return the fallback LLM instead of primary
    """
    primary = LLM_ROUTING.get(agent_name, "kimi")

    # If fallback requested, swap providers
    provider = primary if not fallback else ("anthropic" if primary == "kimi" else "kimi")

    if provider == "kimi" and KIMI_API_KEY:
        return ChatOpenAI(
            api_key=KIMI_API_KEY,
            base_url=KIMI_BASE_URL,
            model=KIMI_MODEL,
            temperature=0.3,
        )
    elif provider == "anthropic" and ANTHROPIC_API_KEY:
        return ChatAnthropic(
            api_key=ANTHROPIC_API_KEY,
            model=ANTHROPIC_MODEL,
            temperature=0.3,
            max_tokens=2048,
        )
    else:
        # Last resort: try whichever is available
        if ANTHROPIC_API_KEY:
            return ChatAnthropic(
                api_key=ANTHROPIC_API_KEY,
                model=ANTHROPIC_MODEL,
                temperature=0.3,
                max_tokens=2048,
            )
        if KIMI_API_KEY:
            return ChatOpenAI(
                api_key=KIMI_API_KEY,
                base_url=KIMI_BASE_URL,
                model=KIMI_MODEL,
                temperature=0.3,
            )
        raise ValueError("No LLM API keys configured. Set KIMI_API_KEY or ANTHROPIC_API_KEY.")


async def invoke_with_fallback(agent_name: str, messages: list) -> str:
    """Invoke LLM with automatic fallback on failure."""
    try:
        llm = get_llm(agent_name, fallback=False)
        response = await llm.ainvoke(messages)
        return response.content
    except Exception:
        try:
            llm = get_llm(agent_name, fallback=True)
            response = await llm.ainvoke(messages)
            return response.content
        except Exception:
            return ""  # Graceful degradation — caller handles empty response
