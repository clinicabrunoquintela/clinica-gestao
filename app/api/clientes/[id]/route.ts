import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCliente, normalizePhone } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET - Buscar cliente por ID
export async function GET(
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

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nomeCompleto: true,
        numeroBI: true,
        numeroBeneficiario: true,
        nif: true,
        sistema: true,
        numeroEntidade: true,
        niss: true,
        medicoAssistente: true,
        genero: true,
        estadoCivil: true,
        dataNascimento: true,
        profissao: true,
        morada: true,
        localidade: true,
        codigoPostal: true,
        telemovel: true,
        email: true,
        vacinacao: true,
        certificadoVacinacao: true,
        certificadoVacinacaoData: true,
        certificadoTestagem: true,
        certificadoTestagemData: true,
        certificadoRecuperacao: true,
        certificadoRecuperacaoData: true,
        jaTeveCovid: true,
        observacoes: true,
        alertas: true,
        createdAt: true,
        marcacoes: {
          select: {
            id: true,
            data: true,
            hora: true,
            tipo: true,
            preco: true,
            status: true,
            observacoes: true,
            createdAt: true,
          },
          orderBy: { data: "desc" },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cliente
export async function PUT(
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

    // Verifica se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validação básica - apenas nomeCompleto é obrigatório
    if (!body.nomeCompleto || body.nomeCompleto.trim() === "") {
      return NextResponse.json(
        { error: "Nome completo é obrigatório" },
        { status: 400 }
      );
    }

    // Normaliza telefone se fornecido (remove espaços e formatação, mantém apenas números)
    const telemovel = body.telemovel && body.telemovel.trim() !== ""
      ? body.telemovel.replace(/\D/g, "") // Remove tudo que não é dígito
      : null;

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nomeCompleto: body.nomeCompleto.trim(),
        numeroBI: body.numeroBI?.trim() || null,
        numeroBeneficiario: body.numeroBeneficiario?.trim() || null,
        nif: body.nif?.trim() || null,
        sistema: body.sistema?.trim() || null,
        numeroEntidade: body.numeroEntidade?.trim() || null,
        niss: body.niss?.trim() || null,
        medicoAssistente: body.medicoAssistente?.trim() || null,
        genero: body.genero?.trim() || null,
        estadoCivil: body.estadoCivil?.trim() || null,
        dataNascimento: body.dataNascimento
          ? new Date(body.dataNascimento)
          : null,
        profissao: body.profissao?.trim() || null,
        morada: body.morada?.trim() || null,
        localidade: body.localidade?.trim() || null,
        codigoPostal: body.codigoPostal?.trim() || null,
        telemovel,
        email: body.email?.trim() || null,
        vacinacao: body.vacinacao?.trim() || null,
        certificadoVacinacao: body.certificadoVacinacao?.trim() || null,
        certificadoVacinacaoData: body.certificadoVacinacaoData
          ? new Date(body.certificadoVacinacaoData)
          : null,
        certificadoTestagem: body.certificadoTestagem?.trim() || null,
        certificadoTestagemData: body.certificadoTestagemData
          ? new Date(body.certificadoTestagemData)
          : null,
        certificadoRecuperacao: body.certificadoRecuperacao?.trim() || null,
        certificadoRecuperacaoData: body.certificadoRecuperacaoData
          ? new Date(body.certificadoRecuperacaoData)
          : null,
        jaTeveCovid: body.jaTeveCovid?.trim() || null,
        observacoes: body.observacoes?.trim() || null,
        alertas: body.alertas?.trim() || null,
      },
      select: {
        id: true,
        nomeCompleto: true,
        numeroBI: true,
        numeroBeneficiario: true,
        nif: true,
        sistema: true,
        numeroEntidade: true,
        niss: true,
        medicoAssistente: true,
        genero: true,
        estadoCivil: true,
        dataNascimento: true,
        profissao: true,
        morada: true,
        localidade: true,
        codigoPostal: true,
        telemovel: true,
        email: true,
        vacinacao: true,
        certificadoVacinacao: true,
        certificadoVacinacaoData: true,
        certificadoTestagem: true,
        certificadoTestagemData: true,
        certificadoRecuperacao: true,
        certificadoRecuperacaoData: true,
        jaTeveCovid: true,
        observacoes: true,
        alertas: true,
        createdAt: true,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    
    // Erro de constraint do Prisma
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Já existe um cliente com estes dados" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar cliente", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar cliente
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

    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Cliente deletado com sucesso",
      id 
    });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    
    // Erro de foreign key constraint (cliente tem marcações)
    if (error instanceof Error && error.message.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "Não é possível deletar o cliente pois possui marcações associadas" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar cliente", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
