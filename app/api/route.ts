import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verificar conexão com a base de dados
    await prisma.$connect();
    
    const stats = {
      clientes: await prisma.cliente.count(),
      marcacoes: await prisma.marcacao.count(),
      users: await prisma.user.count(),
    };

    return NextResponse.json({ 
      message: "API do Dr. Bruno Quintela - Osteopatia",
      version: "1.0.0",
      database: "connected",
      stats
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "API do Dr. Bruno Quintela - Osteopatia",
      version: "1.0.0",
      database: "disconnected",
      error: "Não foi possível conectar à base de dados"
    }, { status: 503 });
  }
}

