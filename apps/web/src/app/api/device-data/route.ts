// api/device-data/route.ts — Store raw device data from mobile
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dataType, value, date } = body as { dataType: string; value: string; date: string };

  if (!dataType || !value || !date) {
    return NextResponse.json({ error: "dataType, value, and date are required" }, { status: 400 });
  }

  const validTypes = ["steps", "screen_time", "notification", "sleep", "calendar"];
  if (!validTypes.includes(dataType)) {
    return NextResponse.json({ error: `Invalid dataType. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  const record = await prisma.deviceData.create({
    data: { dataType, value, date },
  });

  return NextResponse.json({ success: true, id: record.id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const dataType = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;
  if (dataType) where.dataType = dataType;

  const data = await prisma.deviceData.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(data);
}
