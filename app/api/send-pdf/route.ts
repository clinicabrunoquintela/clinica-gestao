import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function POST(req: Request) {
  try {
    const { date } = await req.json();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Sem email do utilizador logado" },
        { status: 400 }
      );
    }

    const targetEmail = session.user.email;

    const dataInicio = new Date(date);
    dataInicio.setHours(0, 0, 0, 0);
    const dataFim = new Date(date);
    dataFim.setHours(23, 59, 59, 999);

    const marcacoes = await prisma.marcacao.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        cliente: true,
      },
      orderBy: { hora: "asc" },
    });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Marcações do Dia", 14, 20);
    doc.setFontSize(12);
    doc.text(`Data: ${format(new Date(date), "dd/MM/yyyy", { locale: ptBR })}`, 14, 30);

    const rows = marcacoes.map((m) => [
      m.hora,
      m.cliente.nomeCompleto,
      m.tipo,
      m.preco ? `${m.preco} €` : "-",
      m.status,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Hora", "Utente", "Tipo", "Preço", "Estado"]],
      body: rows,
    });

    const pdfBuffer = doc.output("arraybuffer");

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Configuração de email incompleta:", {
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_PORT: !!process.env.EMAIL_PORT,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
      });
      return NextResponse.json(
        { success: false, error: "Configuração de email não encontrada" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const dataFormatada = format(new Date(date), "yyyy-MM-dd", { locale: ptBR });

    await transporter.sendMail({
      from: `Sistema Dr. Quintela <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "Marcações do Dia",
      text: "Segue em anexo o PDF com as marcações do dia.",
      attachments: [
        {
          filename: `Consultas_${dataFormatada}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    });

    console.log("✅ PDF enviado com sucesso para:", targetEmail);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao enviar PDF por email:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Erro ao enviar email",
      },
      { status: 500 }
    );
  }
}
