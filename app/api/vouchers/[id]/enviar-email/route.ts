import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

// POST - Enviar voucher por email
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

    // Buscar voucher
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        utente: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
          },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher não encontrado" },
        { status: 404 }
      );
    }

    if (!voucher.utente.email) {
      return NextResponse.json(
        { error: "Utente não tem email cadastrado" },
        { status: 400 }
      );
    }

    // Verificar configuração de email
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      return NextResponse.json(
        { error: "Configuração de email não encontrada" },
        { status: 500 }
      );
    }

    // Calcular data de validade
    const dataValidade = addMonths(voucher.criadoEm, voucher.validadeMeses);
    const dataValidadeFormatada = format(dataValidade, "PPP", { locale: ptBR });

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar email
    await transporter.sendMail({
      from: `Sistema Dr. Quintela <${process.env.EMAIL_USER}>`,
      to: voucher.utente.email,
      subject: `Voucher ${voucher.referencia} - Dr. Bruno Quintela`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F28C1D;">Olá ${voucher.utente.nomeCompleto}!</h2>
          <p>Aqui está o seu voucher <strong>${voucher.referencia}</strong> no valor de <strong>${voucher.valor.toFixed(2)}€</strong>, válido até <strong>${dataValidadeFormatada}</strong>.</p>
          ${voucher.descricao ? `<p>${voucher.descricao}</p>` : ""}
          <p style="margin-top: 20px; color: #666; font-size: 14px;">Agradecemos a sua preferência!</p>
          <p style="color: #666; font-size: 14px;">Dr. Bruno Quintela - Osteopatia</p>
        </div>
      `,
      text: `
        Olá ${voucher.utente.nomeCompleto}!
        
        Aqui está o seu voucher ${voucher.referencia} no valor de ${voucher.valor.toFixed(2)}€, válido até ${dataValidadeFormatada}.
        
        ${voucher.descricao ? voucher.descricao : ""}
        
        Agradecemos a sua preferência!
        Dr. Bruno Quintela - Osteopatia
      `,
    });

    return NextResponse.json({ message: "Email enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
