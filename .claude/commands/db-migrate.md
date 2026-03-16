---
description: Safely modify the database schema
---

1. Read `prisma/schema.prisma` to understand current models
2. Make the requested schema changes
3. Run `npx prisma generate` to regenerate the client
4. Run `npm run db:push` to apply changes to dev.db
5. Update `prisma/seed.ts` if new models need seed data
6. Update any affected API routes or components
7. Run `npm run build` to verify everything compiles

Schema change: $ARGUMENTS
