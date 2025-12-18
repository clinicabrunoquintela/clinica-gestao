import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar lembretes do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const apenasNaoEnviados = searchParams.get("apenasNaoEnviados") === "true";

    const where: any = {
      targetId: userId,
      ...(apenasNaoEnviados && { enviado: false }),
    };

    const lembretes = await prisma.lembrete.findMany({
      where,
      include: {
        criador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        destino: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dataHora: "asc",
      },
    });

    // Filtrar apenas lembretes futuros ou do dia atual
    const agora = new Date();
    const lembretesFiltrados = lembretes.filter((lembrete) => {
      const dataHoraLembrete = new Date(lembrete.dataHora);
      return dataHoraLembrete >= agora || !lembrete.enviado;
    });

    return NextResponse.json(lembretesFiltrados);
  } catch (error) {
    console.error("Erro ao buscar lembretes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lembretes" },
      { status: 500 }
    );
  }
}

// POST - Criar novo lembrete
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
    const { titulo, descricao, dataHora, notificacao, antecedencia, targetId } = body;

    // Validações
    if (!titulo || !dataHora || !notificacao || !targetId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: titulo, dataHora, notificacao, targetId" },
        { status: 400 }
      );
    }

    if (!["app", "email"].includes(notificacao)) {
      return NextResponse.json(
        { error: "notificacao deve ser 'app' ou 'email'" },
        { status: 400 }
      );
    }

    // Verificar se o usuário destino existe
    const usuarioDestino = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!usuarioDestino) {
      return NextResponse.json(
        { error: "Utilizador destino não encontrado" },
        { status: 404 }
      );
    }

    const lembrete = await prisma.lembrete.create({
      data: {
        titulo,
        descricao: descricao || null,
        dataHora: new Date(dataHora),
        notificacao,
        antecedencia: antecedencia || 0,
        userId: session.user.id,
        targetId,
        enviado: false,
      },
      include: {
        criador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        destino: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(lembrete, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao criar lembrete" },
      { status: 500 }
    );
  }
}
