import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "darkbdf@gmail.com" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin já existe" },
        { status: 200 }
      );
    }

    // Criar hash da password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Criar admin
    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: "darkbdf@gmail.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Admin criado com sucesso",
        user: admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar admin",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}







