import { Resend } from "resend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: ["darkbdf@gmail.com"],
      subject: "✅ Teste de email - Clínica Bruno Quintela",
      html: `
        <h2>Email a funcionar 🎉</h2>
        <p>Se estás a ler isto, o Resend está corretamente configurado.</p>
        <p><strong>Projeto:</strong> Clínica Bruno Quintela</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}
