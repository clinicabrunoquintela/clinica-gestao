import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Apagar entrada da lista de espera
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se a entrada existe
    const entrada = await prisma.listaEspera.findUnique({
      where: { id },
    });

    if (!entrada) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 }
      );
    }

    // Apagar entrada
    await prisma.listaEspera.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Entrada apagada com sucesso" });
  } catch (error) {
    console.error("Erro ao apagar entrada:", error);
    return NextResponse.json(
      { error: "Erro ao apagar entrada", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
