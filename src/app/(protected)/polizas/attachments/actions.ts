"use server";

import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { ATTACHMENT_TYPES, getAttachmentTypeConfig } from "./config";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPolicyAttachment(formData: FormData) {
  const policyId = String(formData.get("policyId") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const file = formData.get("file");

  if (!policyId) {
    throw new Error("policyId es obligatorio");
  }

  const allowedTypeKeys = ATTACHMENT_TYPES.map((item) => item.key);

  if (!allowedTypeKeys.includes(type as (typeof allowedTypeKeys)[number])) {
    throw new Error("Tipo de documento inválido");
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

  const config = getAttachmentTypeConfig(type);

  if (!config) {
    throw new Error("Configuración de documento no encontrada");
  }

  const lowerName = file.name.toLowerCase();
  const mimeType = file.type || "";

  const validByMime = config.mimeTypes.some((allowed) => allowed === mimeType);
  const validByExtension = config.accept
    .split(",")
    .some((ext) => lowerName.endsWith(ext.trim().toLowerCase()));

  if (!validByMime && !validByExtension) {
    throw new Error(`Formato inválido para ${config.label}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = sanitizeFileName(file.name);
  const dirPath = path.join(process.cwd(), "storage", "policies", policyId, type);
  const filePath = path.join(dirPath, safeName);
  const relativePath = path.join("policies", policyId, type, safeName);

  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, buffer);

  await prisma.policyAttachment.upsert({
    where: {
      policyId_type: {
        policyId,
        type,
      },
    },
    update: {
      originalName: file.name,
      storagePath: relativePath,
      mimeType: file.type || null,
      sizeBytes: file.size,
    },
    create: {
      policyId,
      type,
      originalName: file.name,
      storagePath: relativePath,
      mimeType: file.type || null,
      sizeBytes: file.size,
    },
  });

  return { ok: true };
}

export async function deletePolicyAttachment(formData: FormData) {
  const attachmentId = String(formData.get("attachmentId") || "").trim();

  if (!attachmentId) {
    throw new Error("attachmentId es obligatorio");
  }

  const attachment = await prisma.policyAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new Error("Adjunto no encontrado");
  }

  const absPath = path.join(process.cwd(), "storage", attachment.storagePath);

  await prisma.policyAttachment.delete({
    where: { id: attachmentId },
  });

  try {
    await unlink(absPath);
  } catch (error) {
    console.warn("No se pudo eliminar el archivo físico:", error);
  }

  return { ok: true };
}