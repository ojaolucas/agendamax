import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Credenciais incompletas" },
        { status: 400 }
      );
    }

    // Find user by email or CPF
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { cpf: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Esta conta foi desativada pelo administrador" },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expires,
    });

    (await cookies()).set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
