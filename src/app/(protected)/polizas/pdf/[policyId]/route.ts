import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: unknown, currency?: string | null) {
  if (value == null) return "-";

  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "MXN",
  }).format(amount);
}

function dateMx(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(value);
}

function safeText(value: unknown) {
  if (value == null) return "-";
  return String(value);
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ policyId: string }> }
) {
  try {
    const { policyId } = await context.params;

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { insurer: true },
    });

    if (!policy) {
      return NextResponse.json({ error: "Póliza no encontrada" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();

    let y = height - 50;
    const left = 50;
    const labelWidth = 170;
    const lineHeight = 18;

    page.drawText("Cédula de Identificación General", {
      x: left,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= 35;

    const rows: Array<[string, string]> = [
      ["Número de póliza", safeText(policy.policyNumber)],
      ["Ramo", safeText(policy.branch)],
      ["Asegurado", safeText(policy.insuredName)],
      ["Tipo de póliza", safeText(policy.policyType)],
      ["Estatus", safeText(policy.status)],
      ["Vigencia inicio", dateMx(policy.startDate)],
      ["Vigencia término", dateMx(policy.endDate)],
      ["Responsable en sitio", safeText(policy.siteManager)],
      ["Aseguradora", safeText(policy.insurer?.name)],
      ["Forma de pago", safeText(policy.paymentMethod)],
      ["Broker - nombre", safeText(policy.brokerName)],
      ["Broker - contacto", safeText(policy.brokerContact)],
      ["Broker - correo", safeText(policy.brokerEmail)],
      ["Broker - celular", safeText(policy.brokerPhone)],
      ["Moneda", safeText(policy.currency)],
      ["Costo", money(policy.policyCost, policy.currency)],
      ["Costo emisión póliza", money(policy.issuanceCost, policy.currency)],
      ["IVA", money(policy.vat, policy.currency)],
      ["Gran total", money(policy.grandTotal, policy.currency)],
      ["Notas", safeText(policy.notes)],
    ];

    for (const [label, value] of rows) {
      if (y < 60) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = 791.89;
        page.drawText("", { x: 0, y: 0, size: 1, font }); // noop para mantener tipos felices
      }

      page.drawText(`${label}:`, {
        x: left,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.15),
      });

      page.drawText(value, {
        x: left + labelWidth,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });

      y -= lineHeight;
    }

    y -= 10;

    page.drawText(
      `Generado el ${new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`,
      {
        x: left,
        y,
        size: 9,
        font,
        color: rgb(0.45, 0.45, 0.45),
      }
    );

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="cedula-${policy.policyNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PDF route error:", error);
    return NextResponse.json(
      { error: "No se pudo generar la carátula PDF" },
      { status: 500 }
    );
  }
}