import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Total de clientes
    const totalClientes = await prisma.cliente.count();

    // Contagem por gênero
    const todosClientes = await prisma.cliente.findMany({
      select: {
        genero: true,
      },
    });

    const totalHomens = todosClientes.filter((c) => {
      const genero = c.genero?.toLowerCase();
      return genero === "male" || genero === "masculino" || genero === "m";
    }).length;

    const totalMulheres = todosClientes.filter((c) => {
      const genero = c.genero?.toLowerCase();
      return genero === "female" || genero === "feminino" || genero === "f";
    }).length;

    // Marcações de hoje
    const marcacoesHoje = await prisma.marcacao.count({
      where: {
        data: {
          gte: hoje,
          lt: amanha,
        },
      },
    });

    // Média de idades
    const clientesComIdade = await prisma.cliente.findMany({
      where: {
        dataNascimento: {
          not: null,
        },
      },
      select: {
        dataNascimento: true,
      },
    });

    let mediaIdades = 0;
    if (clientesComIdade.length > 0) {
      const hojeAno = new Date();
      const idades = clientesComIdade
        .map((cliente) => {
          if (!cliente.dataNascimento) return null;
          const nascimento = new Date(cliente.dataNascimento);
          return hojeAno.getFullYear() - nascimento.getFullYear();
        })
        .filter((idade): idade is number => idade !== null);

      if (idades.length > 0) {
        mediaIdades = Math.round(
          idades.reduce((sum, idade) => sum + idade, 0) / idades.length
        );
      }
    }

    // Marcações futuras (após hoje)
    const marcacoesFuturas = await prisma.marcacao.count({
      where: {
        data: {
          gte: amanha,
        },
      },
    });

    return NextResponse.json({
      totalClientes,
      totalHomens,
      totalMulheres,
      marcacoesHoje,
      mediaIdades,
      marcacoesFuturas,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar estatísticas",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

