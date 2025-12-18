import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const id = params.id;
    const body = await request.json();

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (body.name) {
      updateData.name = body.name.trim();
    }

    if (body.email && body.email !== existingUser.email) {
      // Verificar se novo email já existe
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email já está em uso" },
          { status: 409 }
        );
      }

      updateData.email = body.email.trim();
    }

    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }

    if (body.role) {
      updateData.role = body.role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const id = params.id;

    // Não permitir deletar a si mesmo
    if (id === session.user?.id) {
      return NextResponse.json(
        { error: "Não pode deletar seu próprio usuário" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}


