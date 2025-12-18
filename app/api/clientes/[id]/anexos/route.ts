import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

// GET - Listar anexos do cliente
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

    const anexos = await prisma.anexoUtente.findMany({
      where: { clienteId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(anexos);
  } catch (error) {
    console.error("Erro ao buscar anexos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anexos", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

// POST - Upload de anexo
export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Ficheiro não fornecido" },
        { status: 400 }
      );
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), "public", "uploads", "utentes", id.toString());
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único para o ficheiro
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    const relativePath = `/uploads/utentes/${id}/${fileName}`;

    // Salvar ficheiro
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Salvar no banco de dados
    const anexo = await prisma.anexoUtente.create({
      data: {
        clienteId: id,
        fileName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type || null,
      },
    });

    return NextResponse.json(anexo, { status: 201 });
  } catch (error) {
    console.error("Erro ao fazer upload do anexo:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do anexo", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
