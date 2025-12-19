import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Buscar marcação por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const marcacao = await prisma.marcacao.findUnique({
      where: { id },
      select: {
        id: true,
        clienteId: true,
        data: true,
        hora: true,
        tipo: true,
        preco: true,
        observacoes: true,
        status: true,
        pagamento: true,
        presenca: true,
        falta: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nomeCompleto: true,
            telemovel: true,
            email: true,
            alertas: true,
          },
        },
      },
    });

    if (!marcacao) {
      return NextResponse.json(
        { error: "Marcação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(marcacao);
  } catch (error) {
    console.error("Erro ao buscar marcação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar marcação" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar marcação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const marcacao = await prisma.marcacao.update({
      where: { id },
      data: {
        clienteId: body.clienteId,
        data: body.data ? new Date(body.data) : undefined,
        hora: body.hora,
        tipo: body.tipo,
        preco: body.preco ? parseFloat(body.preco) : null,
        observacoes: body.observacoes,
        status: body.status,
      },
      select: {
        id: true,
        clienteId: true,
        data: true,
        hora: true,
        tipo: true,
        preco: true,
        observacoes: true,
        status: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nomeCompleto: true,
            telemovel: true,
            email: true,
            alertas: true,
          },
        },
      },
    });

    return NextResponse.json(marcacao);
  } catch (error) {
    console.error("Erro ao atualizar marcação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar marcação" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar parcialmente marcação (pagamento, presença, falta)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Preparar dados para atualização
    const updateData: any = {};

    // Se pagamento está sendo atualizado
    if (body.pagamento !== undefined) {
      updateData.pagamento = body.pagamento || null;
    }

    // Se presenca está sendo atualizado
    if (body.presenca !== undefined) {
      updateData.presenca = body.presenca;
      // Se presenca = true, falta = false e status = "concluido"
      if (body.presenca === true) {
        updateData.falta = false;
        updateData.status = "concluido";
      } else if (body.presenca === false && body.falta !== true) {
        // Se presenca = false e falta não está sendo definida, volta para pendente
        updateData.status = "pendente";
      }
    }

    // Se falta está sendo atualizado
    if (body.falta !== undefined) {
      updateData.falta = body.falta;
      // Se falta = true, presenca = false e status = "faltou"
      if (body.falta === true) {
        updateData.presenca = false;
        updateData.status = "faltou";
      } else if (body.falta === false && body.presenca !== true) {
        // Se falta = false e presenca não está sendo definida, volta para pendente
        updateData.status = "pendente";
      }
    }

    // Se status está sendo atualizado diretamente
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const marcacao = await prisma.marcacao.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        clienteId: true,
        data: true,
        hora: true,
        tipo: true,
        preco: true,
        observacoes: true,
        status: true,
        pagamento: true,
        presenca: true,
        falta: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nomeCompleto: true,
            telemovel: true,
            email: true,
            alertas: true,
          },
        },
      },
    });

    return NextResponse.json(marcacao);
  } catch (error) {
    console.error("Erro ao atualizar marcação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar marcação" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar marcação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.marcacao.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Marcação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar marcação:", error);
    return NextResponse.json(
      { error: "Erro ao deletar marcação" },
      { status: 500 }
    );
  }
}

