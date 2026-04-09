"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { deleteCatalogItem } from "./actions";

type Props = {
  id: string;
  label: string;
};

export default function DeleteCatalogItemButton({ id, label }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onDelete() {
    setError(null);

    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      try {
        await deleteCatalogItem(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("No se pudo eliminar el elemento");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
      >
        Eliminar
      </button>

      <GndModal
        open={open}
        title="Eliminar elemento"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            ¿Seguro que deseas eliminar <span className="font-semibold">{label}</span>?
          </p>

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
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={pending}
            >
              {pending ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </GndModal>
    </>
  );
}