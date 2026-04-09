"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { updateTenderMetadata } from "./actions";

type Props = {
  tender: {
    id: string;
    year: number;
    title: string;
    description: string | null;
  };
};

export default function EditTenderButton({ tender }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await updateTenderMetadata(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron actualizar los datos de la licitación"
        );
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
        Editar
      </button>

      <GndModal
        open={open}
        title="Editar licitación"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="tenderId" value={tender.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Año
            </label>
            <input
              name="year"
              type="number"
              defaultValue={tender.year}
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
              defaultValue={tender.title}
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
              defaultValue={tender.description ?? ""}
              className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px]"
              disabled={pending}
            />
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
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </GndModal>
    </>
  );
}