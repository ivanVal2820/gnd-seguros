import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function contentDisposition(filename: string, inline: boolean) {
  const safe = filename.replace(/"/g, "");
  return `${inline ? "inline" : "attachment"}; filename="${safe}"`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ tenderId: string }> }
) {
  const { tenderId } = await context.params;

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const absPath = path.join(process.cwd(), "storage", tender.storagePath);

  try {
    const fileBuffer = await readFile(absPath);

    return new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": tender.mimeType || "application/pdf",
        "Content-Length": String(fileBuffer.length),
        "Content-Disposition": contentDisposition(tender.originalName, true),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 500 });
  }
}