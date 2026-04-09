"use server";

import { prisma } from "@/lib/prisma";

export async function createInsurer(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();

  if (!name) {
    return { ok: false, error: "El nombre es obligatorio" };
  }

  try {
    await prisma.insurer.create({
      data: {
        name,
        code: code || null,
        isActive: true,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo crear la aseguradora" };
  }
}

export async function deleteInsurer(formData: FormData) {
  const id = String(formData.get("id"));

  await prisma.insurer.delete({
    where: { id },
  });
}

export async function updateInsurer(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.insurer.update({
    where: { id },
    data: {
      name,
      code: code || null,
      isActive,
    },
  });
}