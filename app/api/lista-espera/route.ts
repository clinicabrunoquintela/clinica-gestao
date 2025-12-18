import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET - Listar entradas da lista de espera com filtros
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prioridade = searchParams.get("prioridade");
    const terapeuta = searchParams.get("terapeuta");
    const tipoMarcacao = searchParams.get("tipoMarcacao");
    const dataInicial = searchParams.get("dataInicial");
    const dataFinal = searchParams.get("dataFinal");
    const sort = searchParams.get("sort") || "criadoEm";

    const where: any = {};

    if (prioridade) {
      where.prioridade = prioridade;
    }

    if (terapeuta) {
      where.terapeuta = terapeuta;
    }

    if (tipoMarcacao) {
      where.tipoMarcacao = tipoMarcacao;
    }

    if (dataInicial || dataFinal) {
      where.AND = [];
      if (dataInicial) {
        where.AND.push({
          OR: [
            { dataInicial: { gte: new Date(dataInicial) } },
            { dataInicial: null },
          ],
        });
      }
      if (dataFinal) {
        where.AND.push({
          OR: [
            { dataFinal: { lte: new Date(dataFinal) } },
            { dataFinal: null },
          ],
        });
      }
    }

    const orderBy: any = {};
    if (sort === "prioridade") {
      orderBy.prioridade = "desc";
    } else if (sort === "criadoEm") {
      orderBy.criadoEm = "desc";
    } else {
      orderBy.criadoEm = "desc";
    }

    const entradas = await prisma.listaEspera.findMany({
      where,
      include: {
        utente: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
            telemovel: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(entradas);
  } catch (error) {
    console.error("Erro ao buscar lista de espera:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lista de espera", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// POST - Criar nova entrada na lista de espera
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validações
    if (!body.utenteId) {
      return NextResponse.json(
        { error: "Utente é obrigatório" },
        { status: 400 }
      );
    }

    if (!body.prioridade) {
      return NextResponse.json(
        { error: "Prioridade é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se o utente existe
    const utente = await prisma.cliente.findUnique({
      where: { id: body.utenteId },
    });

    if (!utente) {
      return NextResponse.json(
        { error: "Utente não encontrado" },
        { status: 404 }
      );
    }

    // Criar entrada
    const entrada = await prisma.listaEspera.create({
      data: {
        utenteId: body.utenteId,
        prioridade: body.prioridade,
        terapeuta: body.terapeuta?.trim() || null,
        tipoMarcacao: body.tipoMarcacao?.trim() || null,
        dataInicial: body.dataInicial ? new Date(body.dataInicial) : null,
        dataFinal: body.dataFinal ? new Date(body.dataFinal) : null,
        observacoes: body.observacoes?.trim() || null,
        criadoPor: session.user.name || null,
      },
      include: {
        utente: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
            telemovel: true,
          },
        },
      },
    });

    return NextResponse.json(entrada, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar entrada na lista de espera:", error);
    return NextResponse.json(
      { error: "Erro ao criar entrada", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
