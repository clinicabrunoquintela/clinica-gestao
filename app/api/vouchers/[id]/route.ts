import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH - Marcar voucher como usado
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se o voucher existe
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher não encontrado" },
        { status: 404 }
      );
    }

    // Marcar como usado
    const voucherAtualizado = await prisma.voucher.update({
      where: { id },
      data: {
        usado: true,
        usadoEm: new Date(),
      },
      include: {
        utente: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(voucherAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar voucher:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar voucher", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// DELETE - Apagar voucher
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se o voucher existe
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher não encontrado" },
        { status: 404 }
      );
    }

    // Apagar voucher
    await prisma.voucher.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Voucher apagado com sucesso" });
  } catch (error) {
    console.error("Erro ao apagar voucher:", error);
    return NextResponse.json(
      { error: "Erro ao apagar voucher", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
