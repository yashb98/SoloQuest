// api/quests/route.ts — GET quests filtered by hunter level
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });
  if (!hunter) {
    return NextResponse.json({ error: "Hunter not found" }, { status: 404 });
  }

  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      unlocksAtLevel: { lte: hunter.level },
    },
    orderBy: [{ isCompleted: "asc" }, { difficulty: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(quests);
}
