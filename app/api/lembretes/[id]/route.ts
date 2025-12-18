import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Marcar lembrete como enviado
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const lembrete = await prisma.lembrete.update({
      where: { id },
      data: { enviado: true },
    });

    return NextResponse.json(lembrete);
  } catch (error) {
    console.error("Erro ao atualizar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar lembrete" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar lembrete
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se o lembrete pertence ao usuário
    const lembrete = await prisma.lembrete.findUnique({
      where: { id },
    });

    if (!lembrete) {
      return NextResponse.json(
        { error: "Lembrete não encontrado" },
        { status: 404 }
      );
    }

    // Permitir deletar se for o criador ou o destino
    if (lembrete.userId !== session.user.id && lembrete.targetId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão para deletar este lembrete" },
        { status: 403 }
      );
    }

    await prisma.lembrete.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao deletar lembrete" },
      { status: 500 }
    );
  }
}
