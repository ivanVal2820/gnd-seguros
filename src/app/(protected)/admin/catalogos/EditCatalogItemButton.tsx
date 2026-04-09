"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { updateCatalogItem } from "./actions";

type Props = {
  item: {
    id: string;
    label: string;
    code: string | null;
    sortOrder: number;
    isActive: boolean;
  };
};

export default function EditCatalogItemButton({ item }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await updateCatalogItem(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo actualizar el elemento");
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
        title="Editar elemento de catálogo"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Etiqueta
            </label>
            <input
              name="label"
              defaultValue={item.label}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              name="code"
              defaultValue={item.code ?? ""}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Orden
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={item.sortOrder}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item.isActive}
              disabled={pending}
            />
            Activo
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
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