import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const { name, email, cpf, role, active, password } = await req.json();

  try {
    const updateData: any = {
      name,
      email,
      cpf,
      role,
      active,
    };

    if (password && password.trim() !== "") {
      const bcrypt = require("bcrypt");
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}
