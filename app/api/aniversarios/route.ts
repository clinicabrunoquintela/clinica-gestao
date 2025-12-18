import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1; // getMonth() retorna 0-11

    // Buscar todos os clientes cuja dataNascimento corresponde ao dia e mês atual
    const clientes = await prisma.cliente.findMany({
      where: {
        dataNascimento: {
          not: null,
        },
      },
      select: {
        id: true,
        nomeCompleto: true,
        dataNascimento: true,
        telemovel: true,
      },
    });

    // Filtrar clientes cujo aniversário é hoje
    const aniversariantes = clientes
      .filter((cliente) => {
        if (!cliente.dataNascimento) return false;
        const dataNasc = new Date(cliente.dataNascimento);
        return dataNasc.getDate() === dia && dataNasc.getMonth() + 1 === mes;
      })
      .map((cliente) => {
        const dataNasc = new Date(cliente.dataNascimento!);
        const hoje = new Date();
        const idade = hoje.getFullYear() - dataNasc.getFullYear();
        // Ajustar se ainda não fez aniversário este ano
        const mesAniversario = dataNasc.getMonth();
        const diaAniversario = dataNasc.getDate();
        const fezAniversario =
          hoje.getMonth() > mesAniversario ||
          (hoje.getMonth() === mesAniversario && hoje.getDate() >= diaAniversario);
        const idadeCorrigida = fezAniversario ? idade : idade - 1;

        return {
          id: cliente.id,
          nomeCompleto: cliente.nomeCompleto,
          idade: idadeCorrigida,
          telemovel: cliente.telemovel,
        };
      });

    return NextResponse.json({
      total: aniversariantes.length,
      aniversariantes,
    });
  } catch (error) {
    console.error("Erro ao buscar aniversariantes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aniversariantes" },
      { status: 500 }
    );
  }
}
