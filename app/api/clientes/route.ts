import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    const clientes = await prisma.cliente.findMany({
      where: search
        ? {
            OR: [
              { nomeCompleto: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { telemovel: { contains: search, mode: "insensitive" } },
              { nif: { contains: search, mode: "insensitive" } },
              { niss: { contains: search, mode: "insensitive" } },
              { numeroBI: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        nomeCompleto: true,
        numeroBI: true,
        nif: true,
        genero: true,
        dataNascimento: true,
        estadoCivil: true,
        profissao: true,
        morada: true,
        localidade: true,
        codigoPostal: true,
        telemovel: true,
        email: true,
        observacoes: true,
        createdAt: true,
        _count: {
          select: {
            marcacoes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação básica - apenas nomeCompleto é obrigatório
    if (!body.nomeCompleto) {
      return NextResponse.json(
        { error: "Nome completo é obrigatório" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nomeCompleto: body.nomeCompleto.trim(),
        numeroBI: body.numeroBI?.trim() || null,
        nif: body.nif?.trim() || null,
        genero: body.genero?.trim() || null,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        estadoCivil: body.estadoCivil?.trim() || null,
        profissao: body.profissao?.trim() || null,
        morada: body.morada?.trim() || null,
        localidade: body.localidade?.trim() || null,
        codigoPostal: body.codigoPostal?.trim() || null,
        telemovel: body.telemovel?.trim() || null,
        email: body.email?.trim() || null,
        observacoes: body.observacoes?.trim() || null,
      },
      select: {
        id: true,
        nomeCompleto: true,
        numeroBI: true,
        nif: true,
        genero: true,
        dataNascimento: true,
        estadoCivil: true,
        profissao: true,
        morada: true,
        localidade: true,
        codigoPostal: true,
        telemovel: true,
        email: true,
        observacoes: true,
        createdAt: true,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    
    // Erro de constraint do Prisma (ex: email duplicado se fosse unique)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Já existe um cliente com estes dados" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar cliente", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
