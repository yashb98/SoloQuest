---
description: Safely modify the database schema
---

1. Read `apps/web/prisma/schema.prisma` to understand current models
2. Make the requested schema changes
3. Run `cd apps/web && npx prisma generate` to regenerate the client
4. Run `cd apps/web && npm run db:push` to apply changes to dev.db
5. Update `apps/web/prisma/seed.ts` if new models need seed data
6. Update any affected API routes, components, or agent tools
7. If adding agent-related models, update `agents/src/soloquest_agents/tools/soloquest_api.py`
8. Run `cd apps/web && npm run build` to verify everything compiles

Schema change: $ARGUMENTS
