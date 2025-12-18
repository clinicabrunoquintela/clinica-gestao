import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as marcações
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get("data");
    const status = searchParams.get("status");
    const clienteId = searchParams.get("clienteId");

    const marcações = await prisma.marcacao.findMany({
      where: {
        ...(data && {
          data: {
            gte: new Date(data),
            lt: new Date(
              new Date(data).setDate(new Date(data).getDate() + 1)
            ),
          },
        }),
        ...(status && { status }),
        ...(clienteId && { clienteId: parseInt(clienteId) }),
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
      orderBy: [
        { data: "asc" },
        { hora: "asc" },
      ],
    });

    return NextResponse.json(marcações);
  } catch (error) {
    console.error("Erro ao buscar marcações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar marcações" },
      { status: 500 }
    );
  }
}

// POST - Criar nova marcação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: body.clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Utente não encontrado" },
        { status: 404 }
      );
    }

    const marcacao = await prisma.marcacao.create({
      data: {
        clienteId: body.clienteId,
        data: new Date(body.data),
        hora: body.hora,
        tipo: body.tipo,
        preco: body.preco ? parseFloat(body.preco) : null,
        observacoes: body.observacoes,
        status: body.status || "pendente",
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

    return NextResponse.json(marcacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar marcação:", error);
    return NextResponse.json(
      { error: "Erro ao criar marcação" },
      { status: 500 }
    );
  }
}

