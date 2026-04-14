"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { updateUser } from "./actions";

type Props = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
  };
};

export default function EditUserButton({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await updateUser(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo actualizar el usuario");
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
        title="Editar usuario"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              disabled={pending}
            />
            <div className="mt-1 text-xs text-gray-400">
              Solo se permiten correos @gndproperties.mx
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              name="name"
              defaultValue={user.name ?? ""}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              name="role"
              defaultValue={user.role}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={pending}
            >
              <option value="USER">USER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={user.isActive}
              disabled={pending}
            />
            Usuario activo
          </label>

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