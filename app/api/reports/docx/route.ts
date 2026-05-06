import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { processDocxTemplate } from "@/lib/docx";
import { format, startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
  const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

  const events = await prisma.event.findMany({
    where: {
      startDatetime: { gte: startDate, lte: endDate },
    },
    orderBy: { startDatetime: "asc" },
  });

  const settings = await prisma.companySettings.findUnique({ where: { id: "settings" } });
  if (!settings?.reportDocx) return NextResponse.json({ error: "Modelo Word não configurado" }, { status: 400 });

  try {
    const data = {
      periodo: `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`,
      empresa: settings.companyName,
      eventos: events.map(e => ({
        nome: e.eventName,
        cliente: e.clientName,
        local: e.location,
        data: format(new Date(e.startDatetime), "dd/MM HH:mm"),
        materiais: e.materials
      }))
    };

    const docxBlob = processDocxTemplate(settings.reportDocx, data);
    const arrayBuffer = await (docxBlob as any).arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Relatorio_${start}_${end}.docx"`,
      },
    });
  } catch (error) {
    console.error("DOCX Report API Error:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório Word" }, { status: 500 });
  }
}
