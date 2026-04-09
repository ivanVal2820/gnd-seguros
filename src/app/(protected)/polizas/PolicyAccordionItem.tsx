"use client";

import { useState } from "react";
import EditPolicyButton from "./EditPolicyButton";
import DeletePolicyButton from "./DeletePolicyButton";
import UploadPolicyDocument from "./attachments/UploadPolicyDocument";
import DeletePolicyAttachmentButton from "./attachments/DeletePolicyAttachmentButton";
import { ATTACHMENT_TYPES } from "./attachments/config";

type InsurerOption = {
  id: string;
  name: string;
};

type Attachment = {
  id: string;
  type: string;
  originalName: string;
};

type PolicyItem = {
  id: string;
  policyNumber: string;
  branch: string | null;
  insuredName: string | null;
  policyType: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  siteManager: string | null;
  insurerId: string;
  insurer: {
    name: string;
  };
  paymentMethod: string | null;
  brokerName: string | null;
  brokerContact: string | null;
  brokerEmail: string | null;
  brokerPhone: string | null;
  currency: string | null;
  policyCost: unknown;
  issuanceCost: unknown;
  vat: unknown;
  grandTotal: unknown;
  notes: string | null;
  attachments: Attachment[];
};

type Props = {
  policy: PolicyItem;
  insurers: InsurerOption[];
};

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(value);
}

function decimalToString(value: unknown) {
  if (value == null) return "-";
  return String(value);
}

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVA":
      return "bg-green-100 text-green-700";
    case "POR_VENCER":
      return "bg-yellow-100 text-yellow-700";
    case "EN_PROCESO":
      return "bg-blue-100 text-blue-700";
    case "HISTORICO":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function PolicyAccordionItem({ policy, insurers }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {policy.policyNumber}
            </span>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(
                policy.status
              )}`}
            >
              {policy.status}
            </span>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            {policy.insurer.name} · {policy.branch || "Sin ramo"} ·{" "}
            {policy.insuredName || "Sin asegurado"}
          </div>
        </div>

        <div className="shrink-0 text-sm text-gray-500">
          {open ? "Ocultar" : "Ver detalle"}
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
            <div><span className="font-medium">Número:</span> {policy.policyNumber}</div>
            <div><span className="font-medium">Ramo:</span> {policy.branch || "-"}</div>
            <div><span className="font-medium">Asegurado:</span> {policy.insuredName || "-"}</div>
            <div><span className="font-medium">Tipo:</span> {policy.policyType || "-"}</div>
            <div><span className="font-medium">Estatus:</span> {policy.status}</div>
            <div><span className="font-medium">Aseguradora:</span> {policy.insurer.name}</div>
            <div><span className="font-medium">Inicio:</span> {formatDate(policy.startDate)}</div>
            <div><span className="font-medium">Fin:</span> {formatDate(policy.endDate)}</div>
            <div><span className="font-medium">Responsable en sitio:</span> {policy.siteManager || "-"}</div>
            <div><span className="font-medium">Forma de pago:</span> {policy.paymentMethod || "-"}</div>
            <div><span className="font-medium">Broker:</span> {policy.brokerName || "-"}</div>
            <div><span className="font-medium">Contacto broker:</span> {policy.brokerContact || "-"}</div>
            <div><span className="font-medium">Correo broker:</span> {policy.brokerEmail || "-"}</div>
            <div><span className="font-medium">Celular broker:</span> {policy.brokerPhone || "-"}</div>
            <div><span className="font-medium">Moneda:</span> {policy.currency || "-"}</div>
            <div><span className="font-medium">Costo:</span> {decimalToString(policy.policyCost)}</div>
            <div><span className="font-medium">Costo emisión:</span> {decimalToString(policy.issuanceCost)}</div>
            <div><span className="font-medium">IVA:</span> {decimalToString(policy.vat)}</div>
            <div><span className="font-medium">Gran total:</span> {decimalToString(policy.grandTotal)}</div>
            <div className="md:col-span-2">
              <span className="font-medium">Notas:</span> {policy.notes || "-"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`/seguros/polizas/pdf/${policy.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver carátula PDF
            </a>

            <EditPolicyButton policy={policy} insurers={insurers} />
            <DeletePolicyButton id={policy.id} title={policy.policyNumber} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Documentos</h3>

            <div className="space-y-4">
              {ATTACHMENT_TYPES.map((docType) => {
                const attachment = policy.attachments.find(
                  (a) => a.type === docType.key
                );

                return (
                  <div
                    key={docType.key}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {docType.label}
                        </div>

                        <div className="text-xs text-gray-400">
                          Formatos permitidos: {docType.accept.replaceAll(",", ", ")} · Máximo 5 MB
                        </div>

                        <div className="text-sm text-gray-600">
                          {attachment ? (
                            <>
                              Archivo cargado:{" "}
                              <span className="font-medium">
                                {attachment.originalName}
                              </span>
                            </>
                          ) : (
                            "Sin archivo cargado"
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {attachment ? (
                          <>
                            <a
                              href={`/seguros/polizas/attachments/${attachment.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Ver / Descargar
                            </a>

                            <DeletePolicyAttachmentButton
                              attachmentId={attachment.id}
                              name={attachment.originalName}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2">
                      <UploadPolicyDocument
                        policyId={policy.id}
                        type={docType.key}
                        accept={docType.accept}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}