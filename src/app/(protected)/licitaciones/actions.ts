"use server";

import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function createTender(formData: FormData) {
  const yearRaw = String(formData.get("year") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("file");

  const year = Number(yearRaw);

  if (!yearRaw || Number.isNaN(year)) {
    throw new Error("El año es obligatorio");
  }

  if (!title) {
    throw new Error("El título es obligatorio");
  }

  if (!(file instanceof File)) {
    throw new Error("Archivo inválido");
  }

  if (file.size === 0) {
    throw new Error("Debes seleccionar un archivo");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("El archivo excede el tamaño máximo permitido de 5 MB");
  }

  const mimeType = file.type || "";
  const lowerName = file.name.toLowerCase();

  const validPdf =
    mimeType === "application/pdf" || lowerName.endsWith(".pdf");

  if (!validPdf) {
    throw new Error("La licitación solo permite archivos PDF");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = sanitizeFileName(file.name);
  const tenderId = crypto.randomUUID();
  const dirPath = path.join(process.cwd(), "storage", "tenders", String(year), tenderId);
  const filePath = path.join(dirPath, safeName);
  const relativePath = path.join("tenders", String(year), tenderId, safeName);

  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, buffer);

  await prisma.tender.create({
    data: {
      id: tenderId,
      year,
      title,
      description: description || null,
      originalName: file.name,
      storagePath: relativePath,
      mimeType: file.type || null,
      sizeBytes: file.size,
    },
  });

  return { ok: true };
}

export async function deleteTender(formData: FormData) {
  const tenderId = String(formData.get("tenderId") || "").trim();

  if (!tenderId) {
    throw new Error("tenderId es obligatorio");
  }

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new Error("Licitación no encontrada");
  }

  const absPath = path.join(process.cwd(), "storage", tender.storagePath);

  await prisma.tender.delete({
    where: { id: tenderId },
  });

  try {
    await unlink(absPath);
  } catch (error) {
    console.warn("No se pudo eliminar el archivo físico:", error);
  }

  return { ok: true };
}

export async function replaceTenderFile(formData: FormData) {
  const tenderId = String(formData.get("tenderId") || "").trim();
  const file = formData.get("file");

  if (!tenderId) {
    throw new Error("tenderId es obligatorio");
  }

  if (!(file instanceof File)) {
    throw new Error("Archivo inválido");
  }

  if (file.size === 0) {
    throw new Error("Debes seleccionar un archivo");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("El archivo excede el tamaño máximo permitido de 5 MB");
  }

  const mimeType = file.type || "";
  const lowerName = file.name.toLowerCase();

  const validPdf =
    mimeType === "application/pdf" || lowerName.endsWith(".pdf");

  if (!validPdf) {
    throw new Error("La licitación solo permite archivos PDF");
  }

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new Error("Licitación no encontrada");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = sanitizeFileName(file.name);
  const dirPath = path.join(process.cwd(), "storage", "tenders", String(tender.year), tenderId);
  const filePath = path.join(dirPath, safeName);
  const relativePath = path.join("tenders", String(tender.year), tenderId, safeName);

  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, buffer);

  const oldAbsPath = path.join(process.cwd(), "storage", tender.storagePath);

  await prisma.tender.update({
    where: { id: tenderId },
    data: {
      originalName: file.name,
      storagePath: relativePath,
      mimeType: file.type || null,
      sizeBytes: file.size,
    },
  });

  try {
    if (oldAbsPath !== filePath) {
      await unlink(oldAbsPath);
    }
  } catch (error) {
    console.warn("No se pudo eliminar el archivo anterior:", error);
  }

  return { ok: true };
}

export async function updateTenderMetadata(formData: FormData) {
  const tenderId = String(formData.get("tenderId") || "").trim();
  const yearRaw = String(formData.get("year") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const year = Number(yearRaw);

  if (!tenderId) {
    throw new Error("tenderId es obligatorio");
  }

  if (!yearRaw || Number.isNaN(year)) {
    throw new Error("El año es obligatorio");
  }

  if (!title) {
    throw new Error("El título es obligatorio");
  }

  await prisma.tender.update({
    where: { id: tenderId },
    data: {
      year,
      title,
      description: description || null,
    },
  });

  return { ok: true };
}