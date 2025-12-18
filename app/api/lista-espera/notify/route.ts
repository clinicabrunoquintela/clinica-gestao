import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST - Criar lembrete para entrada da lista de espera
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
    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar entrada da lista de espera
    const entrada = await prisma.listaEspera.findUnique({
      where: { id },
      include: {
        utente: {
          select: {
            id: true,
            nomeCompleto: true,
          },
        },
      },
    });

    if (!entrada) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 }
      );
    }

    // Criar lembrete
    // Usar data inicial se existir, senão usar data atual + 7 dias
    const dataHora = entrada.dataInicial || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const lembrete = await prisma.lembrete.create({
      data: {
        titulo: `Lista de Espera - ${entrada.utente.nomeCompleto}`,
        descricao: entrada.observacoes || `Utente na lista de espera. Tipo: ${entrada.tipoMarcacao || "Não especificado"}. Prioridade: ${entrada.prioridade}`,
        dataHora,
        notificacao: "app",
        antecedencia: 0,
        userId: session.user.id,
        targetId: session.user.id,
        enviado: false,
      },
    });

    return NextResponse.json({ message: "Lembrete criado com sucesso", lembrete });
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao criar lembrete", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
