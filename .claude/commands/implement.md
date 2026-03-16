---
description: Implement a feature following SoloQuest engineering standards
---

Before writing any code:
1. Read root `CLAUDE.md` + relevant workspace `CLAUDE.md` (apps/web/, apps/mobile/)
2. Determine which workspace(s) this feature touches (web, mobile, agents, shared)
3. Scan related files in the codebase to understand existing patterns
4. Create a plan with exact file paths and changes needed
5. Implement with proper TypeScript types and Tailwind styling
6. For web: ensure API routes use `export const dynamic = "force-dynamic"`, add toast notifications
7. For mobile: use Zustand stores, NativeWind styling, Expo Router navigation
8. For agents: follow LangGraph patterns, add Langfuse tracing, use LLM router
9. Verify with `cd apps/web && npm run build` for web changes

Feature to implement: $ARGUMENTS
