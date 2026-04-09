"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPolicyAttachment } from "./actions";

type Props = {
  policyId: string;
  type:
    | "POLIZA"
    | "CERTIFICADO"
    | "FACTURA"
    | "XML"
    | "REFERENCIA_PAGO"
    | "OTRO_1"
    | "OTRO_2"
    | "OTRO_3";
  accept: string;
};

export default function UploadPolicyDocument({ policyId, type, accept }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function action(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await uploadPolicyAttachment(formData);
        router.refresh();
      } catch (err) {
  console.error(err);
  setError(err instanceof Error ? err.message : "No se pudo subir el archivo");
}
    });
  }

  return (
    <form action={action} className="flex flex-col gap-2 md:flex-row md:items-center">
      <input type="hidden" name="policyId" value={policyId} />
      <input type="hidden" name="type" value={type} />

      <input
        type="file"
        name="file"
        accept={accept}
        className="text-sm"
        disabled={pending}
        required
      />

      <div className="text-xs text-gray-400">
        · Máximo 5 MB
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#043230] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Subiendo..." : "Subir"}
      </button>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </form>
  );
}