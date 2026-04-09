"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { createTender } from "./actions";

export default function NewTenderButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await createTender(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo crear la licitación");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
      >
        Nueva licitación
      </button>

      <GndModal
        open={open}
        title="Nueva licitación"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Año
            </label>
            <input
              name="year"
              type="number"
              placeholder="Ej. 2026"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              name="title"
              placeholder="Nombre de la licitación"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              placeholder="Descripción breve"
              className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px]"
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Archivo PDF
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
              className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={pending}
            >
              {pending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </GndModal>
    </>
  );
}