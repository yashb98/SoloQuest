---
description: Add a new quest to SoloQuest with proper game balancing
---

Add a new quest following SoloQuest's quest system:

1. Read `src/lib/quest-details.ts` to understand existing quest format
2. Read `prisma/seed.ts` to see how quests are seeded
3. Determine appropriate values:
   - Category: health | learning | jobs | finance | focus | food | mental | agentiq
   - Tier: daily | weekly | custom
   - Difficulty: normal | hard | legendary
   - XP/Gold rewards (balanced with existing quests of same tier/difficulty)
   - Stat bonuses matching the category
4. Add quest metadata to `quest-details.ts`
5. Add seed data to `prisma/seed.ts`
6. Run `npm run db:seed` to verify

Quest to add: $ARGUMENTS
