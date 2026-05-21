"use client";

import { useRef, useState, useTransition } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  function submitFile(file: File) {
    setError(null);

    const formData = new FormData();
    formData.set("policyId", policyId);
    formData.set("type", type);
    formData.set("file", file);

    startTransition(async () => {
      try {
        await uploadPolicyAttachment(formData);
        setSelectedFile(null);

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        router.refresh();
      } catch (err) {
        console.error(err);
        setError("No se pudo subir el archivo");
      }
    });
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    submitFile(file);
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    submitFile(file);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-xl border border-dashed p-4 text-center text-sm transition ${
          dragging
            ? "border-[#043230] bg-[#f4fbfb] text-[#043230]"
            : "border-gray-300 bg-gray-50 text-gray-600 hover:border-[#043230] hover:bg-gray-100"
        } ${pending ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={accept}
          className="hidden"
          disabled={pending}
          onChange={onFileChange}
        />

        <div className="font-medium">
          {pending ? "Subiendo archivo..." : "Arrastra un archivo aquí"}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          o haz clic para seleccionarlo
        </div>

        {selectedFile ? (
          <div className="mt-2 truncate text-xs text-gray-700">
            Archivo: {selectedFile.name}
          </div>
        ) : null}

        <div className="mt-2 text-xs text-gray-400">
          Tipos permitidos: {accept}
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}