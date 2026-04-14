"use server";

import { prisma } from "@/lib/prisma";

function normalize(value: FormDataEntryValue | null) {
  const s = String(value || "").trim();
  return s || null;
}

function validateEmailDomain(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!normalized.endsWith("@gndproperties.mx")) {
    throw new Error("Solo se permiten correos con dominio @gndproperties.mx");
  }

  return normalized;
}

function validateRole(role: string) {
  if (role !== "USER" && role !== "SUPERADMIN") {
    throw new Error("Rol inválido");
  }

  return role;
}

export async function createUser(formData: FormData) {
  const emailRaw = String(formData.get("email") || "").trim();
  const name = normalize(formData.get("name"));
  const roleRaw = String(formData.get("role") || "USER").trim();

  if (!emailRaw) {
    throw new Error("El correo es obligatorio");
  }

  const email = validateEmailDomain(emailRaw);
  const role = validateRole(roleRaw);

  await prisma.user.create({
    data: {
      email,
      name,
      role,
      isActive: true,
    },
  });

  return { ok: true };
}

export async function updateUser(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const emailRaw = String(formData.get("email") || "").trim();
  const name = normalize(formData.get("name"));
  const roleRaw = String(formData.get("role") || "USER").trim();
  const isActive = formData.get("isActive") === "on";

  if (!id) {
    throw new Error("El id es obligatorio");
  }

  if (!emailRaw) {
    throw new Error("El correo es obligatorio");
  }

  const email = validateEmailDomain(emailRaw);
  const role = validateRole(roleRaw);

  await prisma.user.update({
    where: { id },
    data: {
      email,
      name,
      role,
      isActive,
    },
  });

  return { ok: true };
}