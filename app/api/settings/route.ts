import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let settings = await prisma.companySettings.findUnique({
    where: { id: "settings" },
  });

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: { id: "settings" },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const data = await req.json();

  try {
    const updated = await prisma.companySettings.update({
      where: { id: "settings" },
      data: {
        companyName: data.companyName,
        logo: data.logo,
        address: data.address,
        phone: data.phone,
        email: data.email,
        deliveryTemplate: data.deliveryTemplate,
        reportTemplate: data.reportTemplate,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
