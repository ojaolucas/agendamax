import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role === "LOGISTICS") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        eventName: body.eventName,
        clientName: body.clientName,
        location: body.location,
        eventType: body.eventType,
        startDatetime: new Date(body.startDatetime),
        endDatetime: new Date(body.endDatetime),
        setupDatetime: new Date(body.setupDatetime),
        teardownDatetime: new Date(body.teardownDatetime),
        materials: body.materials,
        description: body.description || "",
        status: "PLANNING",
      },
    });

    // Initial audit log for creation
    await prisma.auditLog.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        field: "status",
        previousValue: null,
        newValue: "PLANNING",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startDatetime: "desc" },
  });
  return NextResponse.json(events);
}
