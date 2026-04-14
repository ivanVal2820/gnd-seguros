"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { createPolicy } from "./actions";

type CatalogOption = {
  id: string;
  label: string;
};

type InsurerOption = {
  id: string;
  name: string;
};

type Props = {
  insurers: InsurerOption[];
  branches: CatalogOption[];
  policyTypes: CatalogOption[];
  paymentMethods: CatalogOption[];
};

export default function NewPolicyButton({ insurers, branches, policyTypes, paymentMethods }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await createPolicy(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("No se pudo crear la póliza");
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
        Nueva póliza
      </button>

      <GndModal
        open={open}
        title="Nueva póliza"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input name="policyNumber" placeholder="Número de póliza" className="rounded-lg border px-3 py-2 text-sm" required disabled={pending} />
          <select
            name="branch"
            className="rounded-lg border px-3 py-2 text-sm"
            defaultValue=""
            disabled={pending}
          >
            <option value="">Ramo</option>
            {branches.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
          <input name="insuredName" placeholder="Asegurado" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select
            name="policyType"
            className="rounded-lg border px-3 py-2 text-sm"
            defaultValue=""
            disabled={pending}
          >
            <option value="">Tipo de póliza</option>
            {policyTypes.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>

          <select name="status" className="rounded-lg border px-3 py-2 text-sm" defaultValue="EN_PROCESO" disabled={pending}>
            <option value="ACTIVA">Activa</option>
            <option value="POR_VENCER">Por vencer</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="HISTORICO">Histórico</option>
          </select>

          <input name="startDate" type="date" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="endDate" type="date" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="siteManager" placeholder="Responsable en sitio" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select name="insurerId" className="rounded-lg border px-3 py-2 text-sm" required defaultValue="" disabled={pending}>
            <option value="" disabled>Selecciona aseguradora</option>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>

          <select
            name="paymentMethod"
            className="rounded-lg border px-3 py-2 text-sm"
            defaultValue=""
            disabled={pending}
          >
            <option value="">Forma de pago</option>
            {paymentMethods.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
          <input name="brokerName" placeholder="Broker - nombre" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerContact" placeholder="Broker - contacto" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerEmail" placeholder="Broker - correo electrónico" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerPhone" placeholder="Broker - celular" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select name="currency" className="rounded-lg border px-3 py-2 text-sm" defaultValue="MXN" disabled={pending}>
            <option value="MXN">Pesos</option>
            <option value="USD">Dólares</option>
          </select>

          <input name="policyCost" type="number" step="0.01" placeholder="Costo" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="issuanceCost" type="number" step="0.01" placeholder="Costo emisión póliza" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="vat" type="number" step="0.01" placeholder="IVA" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="grandTotal" type="number" step="0.01" placeholder="Gran total" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <textarea
            name="notes"
            placeholder="Notas"
            className="md:col-span-2 min-h-[90px] rounded-lg border px-3 py-2 text-sm"
            disabled={pending}
          />

          {error ? (
            <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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