import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { processDocxTemplate } from "@/lib/docx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  const settings = await prisma.companySettings.findUnique({ where: { id: "settings" } });

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  if (!settings?.deliveryDocx) return NextResponse.json({ error: "Modelo Word não configurado" }, { status: 400 });

  try {
    const data = {
      nome: event.clientName,
      cliente: event.clientName,
      evento: event.eventName,
      local: event.location,
      endereco: event.address || event.location,
      contato: event.clientContact || "",
      data_evento: format(new Date(event.startDatetime), "dd/MM/yyyy"),
      data_hoje: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      empresa: settings.companyName,
      materiais: event.materials.split("\n").map(m => ({ nome: m })) // For loops in docx
    };

    const docxBlob = processDocxTemplate(settings.deliveryDocx, data);
    const arrayBuffer = await (docxBlob as any).arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Termo_${event.eventName.replace(/\s+/g, '_')}.docx"`,
      },
    });
  } catch (error) {
    console.error("DOCX API Error:", error);
    return NextResponse.json({ error: "Erro ao gerar documento Word" }, { status: 500 });
  }
}
