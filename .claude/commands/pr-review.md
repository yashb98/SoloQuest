---
description: Deep code review before PR submission
---

Review the current changes (git diff against main):

1. Check for security vulnerabilities (XSS, injection, env leaks)
2. Verify TypeScript types are correct (no `any` types sneaking in)
3. Ensure all new API routes follow existing patterns (force-dynamic, try/catch, proper status codes)
4. Check dark mode + mobile responsiveness for any UI changes
5. Verify game mechanics are correct (XP formulas, rank thresholds, streak logic)
6. Ensure no `.env` values or API keys in the diff
7. Generate a PR description with:
   - What changed and why
   - Game systems affected (if any)
   - Testing steps
