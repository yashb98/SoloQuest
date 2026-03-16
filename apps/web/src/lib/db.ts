// lib/db.ts — Database client with dev/prod switch
// Development: PrismaLibSql adapter → local SQLite file
// Production:  PrismaLibSql adapter → Turso edge DB

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    return new PrismaClient({ adapter });
  }

  // Development: local SQLite via libsql file URL
  const adapter = new PrismaLibSql({
    url: "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
