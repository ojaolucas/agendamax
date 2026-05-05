import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { name, email, cpf, password, role } = await req.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "E-mail ou CPF já cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
