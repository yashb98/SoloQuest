// api/hunter/class/route.ts — POST select hunter class
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hunterClass } = body as { hunterClass: string };

  const valid = ["warrior", "scholar", "rogue", "paladin"];
  if (!valid.includes(hunterClass)) {
    return NextResponse.json({ error: "Invalid class" }, { status: 400 });
  }

  await prisma.hunter.update({
    where: { id: 1 },
    data: { class: hunterClass },
  });

  return NextResponse.json({ success: true, class: hunterClass });
}
