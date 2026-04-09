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
  context: { params: Promise<{ attachmentId: string }> }
) {
  const { attachmentId } = await context.params;

  const attachment = await prisma.policyAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const absPath = path.join(process.cwd(), "storage", attachment.storagePath);

  try {
    const fileBuffer = await readFile(absPath);

    return new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType || "application/octet-stream",
        "Content-Length": String(fileBuffer.length),
        "Content-Disposition": contentDisposition(attachment.originalName, true),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 500 });
  }
}