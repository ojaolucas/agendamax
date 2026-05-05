import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role === "LOGISTICS") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const currentEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!currentEvent) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    // Identify changes for audit log
    const changes: any[] = [];
    const fieldsToCompare = [
      "eventName", "clientName", "location", "eventType", "status", 
      "materials", "description", "startDatetime", "endDatetime", 
      "setupDatetime", "teardownDatetime"
    ];

    fieldsToCompare.forEach((field) => {
      let oldVal = (currentEvent as any)[field];
      let newVal = body[field];

      // Handle dates comparison
      if (field.endsWith("Datetime")) {
        oldVal = new Date(oldVal).toISOString();
        newVal = new Date(newVal).toISOString();
      }

      if (oldVal !== newVal) {
        changes.push({
          eventId: id,
          userId: session.user.id,
          field,
          previousValue: String(oldVal),
          newValue: String(newVal),
        });
      }
    });

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        eventName: body.eventName,
        clientName: body.clientName,
        location: body.location,
        eventType: body.eventType,
        status: body.status,
        startDatetime: new Date(body.startDatetime),
        endDatetime: new Date(body.endDatetime),
        setupDatetime: new Date(body.setupDatetime),
        teardownDatetime: new Date(body.teardownDatetime),
        materials: body.materials,
        description: body.description || "",
      },
    });

    // Save audit logs if any changes
    if (changes.length > 0) {
      await prisma.auditLog.createMany({
        data: changes,
      });
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { AuditLog: true }
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}
