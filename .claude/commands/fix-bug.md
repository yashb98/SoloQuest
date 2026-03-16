---
description: Diagnose and fix a bug in SoloQuest
---

1. Analyze the error or bug description provided
2. Determine which workspace is affected (web, mobile, agents, shared)
3. Search the relevant codebase for the affected code paths
4. Identify the root cause (not just symptoms)
5. Fix the issue with minimal changes
6. Verify the fix doesn't break game mechanics (XP, ranks, streaks, penalties)
7. For web: run `cd apps/web && npm run build`
8. For agents: run `cd agents && python -m pytest`

Bug to fix: $ARGUMENTS
