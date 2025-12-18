import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Função para gerar referência única: BQ_ + 4 letras + 4 números
async function gerarReferencia(): Promise<string> {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  
  let referencia: string;
  let existe: boolean;
  
  do {
    // Gerar 4 letras aleatórias
    let parteLetras = "";
    for (let i = 0; i < 4; i++) {
      parteLetras += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    
    // Gerar 4 números aleatórios
    let parteNumeros = "";
    for (let i = 0; i < 4; i++) {
      parteNumeros += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }
    
    referencia = `BQ_${parteLetras}${parteNumeros}`;
    
    // Verificar se já existe
    const existente = await prisma.voucher.findUnique({
      where: { referencia },
    });
    existe = existente !== null;
  } while (existe);
  
  return referencia;
}

// GET - Listar todos os vouchers
export async function GET(request: NextRequest) {
  try {
    const vouchers = await prisma.voucher.findMany({
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
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Erro ao buscar vouchers:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vouchers", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// POST - Criar novo voucher
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

    if (!body.valor || body.valor < 0) {
      return NextResponse.json(
        { error: "Valor inválido" },
        { status: 400 }
      );
    }

    if (!body.validadeMeses) {
      return NextResponse.json(
        { error: "Validade é obrigatória" },
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

    // Gerar referência única
    const referencia = await gerarReferencia();

    // Criar voucher
    const voucher = await prisma.voucher.create({
      data: {
        referencia,
        validadeMeses: body.validadeMeses,
        valor: parseFloat(body.valor),
        criadoPorId: session.user.id,
        utenteId: body.utenteId,
        descricao: body.descricao?.trim() || null,
        observacoes: body.observacoes?.trim() || null,
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

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar voucher:", error);
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Referência já existe. Tente novamente." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar voucher", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
