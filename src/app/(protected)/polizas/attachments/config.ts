export const ATTACHMENT_TYPES = [
  {
    key: "POLIZA",
    label: "Póliza",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "CERTIFICADO",
    label: "Certificado",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "FACTURA",
    label: "Factura",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "XML",
    label: "XML",
    accept: ".xml",
    mimeTypes: ["application/xml", "text/xml"],
  },
  {
    key: "REFERENCIA_PAGO",
    label: "Referencia de pago",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "OTRO_1",
    label: "Otros documentos 1",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "OTRO_2",
    label: "Otros documentos 2",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    key: "OTRO_3",
    label: "Otros documentos 3",
    accept: ".pdf,.jpg,.jpeg,.png",
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
] as const;

export type AttachmentType = (typeof ATTACHMENT_TYPES)[number]["key"];

export function getAttachmentTypeConfig(type: string) {
  return ATTACHMENT_TYPES.find((item) => item.key === type);
}