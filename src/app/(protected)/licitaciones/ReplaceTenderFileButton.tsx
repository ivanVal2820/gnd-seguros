"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { replaceTenderFile } from "./actions";

type Props = {
  tenderId: string;
  title: string;
};

export default function ReplaceTenderFileButton({ tenderId, title }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await replaceTenderFile(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo reemplazar el PDF");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
      >
        Reemplazar PDF
      </button>

      <GndModal
        open={open}
        title="Reemplazar PDF"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="tenderId" value={tenderId} />

          <div className="text-sm text-gray-700">
            Licitación: <span className="font-medium">{title}</span>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nuevo archivo PDF
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              className="w-full text-sm"
              required
              disabled={pending}
            />
            <div className="mt-1 text-xs text-gray-400">
              Formato permitido: .pdf · Máximo 5 MB
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!pending) {
                  setOpen(false);
                  setError(null);
                }
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700"
              disabled={pending}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={pending}
            >
              {pending ? "Reemplazando..." : "Guardar"}
            </button>
          </div>
        </form>
      </GndModal>
    </>
  );
}