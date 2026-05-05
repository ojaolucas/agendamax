import { prisma } from "@/lib/prisma";
import { getSession, encrypt } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      role: true,
      image: true,
      active: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, email, cpf, image } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        cpf,
        image, // Base64 string
      },
    });

    // Update the session cookie with new info
    const newSession = {
      ...session,
      user: {
        ...session.user,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    };

    const cookieStore = await cookies();
    cookieStore.set("session", await encrypt(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
