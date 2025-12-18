import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agora = new Date();

    // Buscar lembretes não enviados que devem ser enviados agora
    const lembretes = await prisma.lembrete.findMany({
      where: {
        enviado: false,
      },
      include: {
        criador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        destino: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const lembretesParaEnviar = lembretes.filter((lembrete) => {
      const dataHoraLembrete = new Date(lembrete.dataHora);
      const dataNotificacao = new Date(
        dataHoraLembrete.getTime() - lembrete.antecedencia * 60 * 1000
      );

      // Verificar se é hora de enviar (dentro de uma janela de 1 minuto)
      const diferenca = agora.getTime() - dataNotificacao.getTime();
      return diferenca >= 0 && diferenca <= 60000; // 1 minuto de tolerância
    });

    const resultados = [];

    for (const lembrete of lembretesParaEnviar) {
      try {
        if (lembrete.notificacao === "email") {
          // Enviar email
          if (
            !process.env.EMAIL_HOST ||
            !process.env.EMAIL_PORT ||
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASS
          ) {
            console.error("❌ Configuração de email incompleta");
            resultados.push({
              lembreteId: lembrete.id,
              sucesso: false,
              erro: "Configuração de email não encontrada",
            });
            continue;
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

          const dataHoraFormatada = new Date(lembrete.dataHora).toLocaleString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          await transporter.sendMail({
            from: `Sistema Dr. Quintela <${process.env.EMAIL_USER}>`,
            to: lembrete.destino.email,
            subject: `Lembrete: ${lembrete.titulo}`,
            html: `
              <h2>${lembrete.titulo}</h2>
              ${lembrete.descricao ? `<p>${lembrete.descricao}</p>` : ""}
              <p><strong>Data/Hora:</strong> ${dataHoraFormatada}</p>
              ${lembrete.antecedencia > 0 ? `<p><strong>Antecedência:</strong> ${lembrete.antecedencia} minutos</p>` : ""}
              <p>Criado por: ${lembrete.criador.name}</p>
            `,
            text: `
              ${lembrete.titulo}
              ${lembrete.descricao ? `\n${lembrete.descricao}` : ""}
              \nData/Hora: ${dataHoraFormatada}
              ${lembrete.antecedencia > 0 ? `\nAntecedência: ${lembrete.antecedencia} minutos` : ""}
              \nCriado por: ${lembrete.criador.name}
            `,
          });

          console.log(`✅ Email enviado para lembrete ${lembrete.id}`);
        }

        // Marcar como enviado (tanto para app quanto email)
        await prisma.lembrete.update({
          where: { id: lembrete.id },
          data: { enviado: true },
        });

        resultados.push({
          lembreteId: lembrete.id,
          sucesso: true,
          tipo: lembrete.notificacao,
        });
      } catch (error) {
        console.error(`❌ Erro ao processar lembrete ${lembrete.id}:`, error);
        resultados.push({
          lembreteId: lembrete.id,
          sucesso: false,
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json({
      processados: lembretesParaEnviar.length,
      resultados,
    });
  } catch (error) {
    console.error("❌ Erro no scheduler de lembretes:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar lembretes",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
