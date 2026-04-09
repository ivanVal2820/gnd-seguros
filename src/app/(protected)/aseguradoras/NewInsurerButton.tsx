"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { createInsurer } from "./actions";

export default function NewInsurerButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await createInsurer(formData);

      if (!result.ok) {
        setError(result.error ?? "Ocurrió un error");
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
      >
        Nueva aseguradora
      </button>

      <GndModal
        open={open}
        title="Nueva aseguradora"
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
              Nombre
            </label>
            <input
              name="name"
              placeholder="Ej. AXA"
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
              placeholder="Ej. AXA"
              className="w-full rounded-lg border px-3 py-2 text-sm"
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