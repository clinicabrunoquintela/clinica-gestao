import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

// DELETE - Apagar anexo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; anexoId: string } }
) {
  try {
    const clienteId = parseInt(params.id);
    const anexoId = parseInt(params.anexoId);

    if (isNaN(clienteId) || isNaN(anexoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar anexo
    const anexo = await prisma.anexoUtente.findUnique({
      where: { id: anexoId },
    });

    if (!anexo) {
      return NextResponse.json(
        { error: "Anexo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o anexo pertence ao cliente
    if (anexo.clienteId !== clienteId) {
      return NextResponse.json(
        { error: "Anexo não pertence a este cliente" },
        { status: 403 }
      );
    }

    // Apagar ficheiro do sistema de ficheiros
    const filePath = join(process.cwd(), "public", anexo.filePath);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error("Erro ao apagar ficheiro:", error);
        // Continua mesmo se o ficheiro não existir
      }
    }

    // Apagar do banco de dados
    await prisma.anexoUtente.delete({
      where: { id: anexoId },
    });

    return NextResponse.json({ message: "Anexo apagado com sucesso" });
  } catch (error) {
    console.error("Erro ao apagar anexo:", error);
    return NextResponse.json(
      { error: "Erro ao apagar anexo", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
