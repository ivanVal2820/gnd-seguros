"use server";

import { prisma } from "@/lib/prisma";

function normalize(value: FormDataEntryValue | null) {
  const s = String(value || "").trim();
  return s || null;
}

export async function createCatalogItem(formData: FormData) {
  const category = String(formData.get("category") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const code = normalize(formData.get("code"));
  const sortOrderRaw = String(formData.get("sortOrder") || "").trim();

  if (!category) throw new Error("La categoría es obligatoria");
  if (!label) throw new Error("La etiqueta es obligatoria");

  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0;
  if (Number.isNaN(sortOrder)) throw new Error("sortOrder inválido");

  await prisma.catalogItem.create({
    data: {
      category,
      label,
      code,
      sortOrder,
      isActive: true,
    },
  });

  return { ok: true };
}

export async function updateCatalogItem(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const code = normalize(formData.get("code"));
  const sortOrderRaw = String(formData.get("sortOrder") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!id) throw new Error("El id es obligatorio");
  if (!label) throw new Error("La etiqueta es obligatoria");

  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0;
  if (Number.isNaN(sortOrder)) throw new Error("sortOrder inválido");

  await prisma.catalogItem.update({
    where: { id },
    data: {
      label,
      code,
      sortOrder,
      isActive,
    },
  });

  return { ok: true };
}

export async function deleteCatalogItem(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("El id es obligatorio");

  await prisma.catalogItem.delete({
    where: { id },
  });

  return { ok: true };
}