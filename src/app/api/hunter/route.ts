// api/hunter/route.ts — GET hunter profile
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hunter = await prisma.hunter.findFirst({ where: { id: 1 } });

  if (!hunter) {
    return NextResponse.json(
      { error: "Hunter not found. Run the seed script." },
      { status: 404 }
    );
  }

  return NextResponse.json(hunter);
}
