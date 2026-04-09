"use server";

import { prisma } from "@/lib/prisma";

function toNullableString(value: FormDataEntryValue | null) {
  const s = String(value || "").trim();
  return s || null;
}

function toNullableDate(value: FormDataEntryValue | null) {
  const s = String(value || "").trim();
  return s ? new Date(s) : null;
}

function toNullableDecimal(value: FormDataEntryValue | null) {
  const s = String(value || "").trim();
  return s ? s : null;
}

export async function createPolicy(formData: FormData) {
  const policyNumber = String(formData.get("policyNumber") || "").trim();
  const insurerId = String(formData.get("insurerId") || "").trim();

  if (!policyNumber) throw new Error("El número de póliza es obligatorio");
  if (!insurerId) throw new Error("La aseguradora es obligatoria");

  await prisma.policy.create({
    data: {
      policyNumber,
      branch: toNullableString(formData.get("branch")),
      insuredName: toNullableString(formData.get("insuredName")),
      policyType: toNullableString(formData.get("policyType")),
      status: String(formData.get("status") || "EN_PROCESO").trim(),
      startDate: toNullableDate(formData.get("startDate")),
      endDate: toNullableDate(formData.get("endDate")),
      siteManager: toNullableString(formData.get("siteManager")),
      insurerId,
      paymentMethod: toNullableString(formData.get("paymentMethod")),
      brokerName: toNullableString(formData.get("brokerName")),
      brokerContact: toNullableString(formData.get("brokerContact")),
      brokerEmail: toNullableString(formData.get("brokerEmail")),
      brokerPhone: toNullableString(formData.get("brokerPhone")),
      currency: String(formData.get("currency") || "MXN").trim(),
      policyCost: toNullableDecimal(formData.get("policyCost")),
      issuanceCost: toNullableDecimal(formData.get("issuanceCost")),
      vat: toNullableDecimal(formData.get("vat")),
      grandTotal: toNullableDecimal(formData.get("grandTotal")),
      notes: toNullableString(formData.get("notes")),
    },
  });
}

export async function updatePolicy(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const policyNumber = String(formData.get("policyNumber") || "").trim();
  const insurerId = String(formData.get("insurerId") || "").trim();

  if (!id) throw new Error("El id es obligatorio");
  if (!policyNumber) throw new Error("El número de póliza es obligatorio");
  if (!insurerId) throw new Error("La aseguradora es obligatoria");

  await prisma.policy.update({
    where: { id },
    data: {
      policyNumber,
      branch: toNullableString(formData.get("branch")),
      insuredName: toNullableString(formData.get("insuredName")),
      policyType: toNullableString(formData.get("policyType")),
      status: String(formData.get("status") || "EN_PROCESO").trim(),
      startDate: toNullableDate(formData.get("startDate")),
      endDate: toNullableDate(formData.get("endDate")),
      siteManager: toNullableString(formData.get("siteManager")),
      insurerId,
      paymentMethod: toNullableString(formData.get("paymentMethod")),
      brokerName: toNullableString(formData.get("brokerName")),
      brokerContact: toNullableString(formData.get("brokerContact")),
      brokerEmail: toNullableString(formData.get("brokerEmail")),
      brokerPhone: toNullableString(formData.get("brokerPhone")),
      currency: String(formData.get("currency") || "MXN").trim(),
      policyCost: toNullableDecimal(formData.get("policyCost")),
      issuanceCost: toNullableDecimal(formData.get("issuanceCost")),
      vat: toNullableDecimal(formData.get("vat")),
      grandTotal: toNullableDecimal(formData.get("grandTotal")),
      notes: toNullableString(formData.get("notes")),
    },
  });
}

export async function deletePolicy(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("El id es obligatorio");

  await prisma.policy.delete({
    where: { id },
  });
}