"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { updatePolicy } from "./actions";

type InsurerOption = {
  id: string;
  name: string;
};

type PolicyItem = {
  id: string;
  policyNumber: string;
  branch: string | null;
  insuredName: string | null;
  policyType: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  siteManager: string | null;
  insurerId: string;
  paymentMethod: string | null;
  brokerName: string | null;
  brokerContact: string | null;
  brokerEmail: string | null;
  brokerPhone: string | null;
  currency: string | null;
  policyCost: unknown;
  issuanceCost: unknown;
  vat: unknown;
  grandTotal: unknown;
  notes: string | null;
};

type Props = {
  policy: PolicyItem;
  insurers: InsurerOption[];
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function decimalToString(value: unknown) {
  if (value == null) return "";
  return String(value);
}

export default function EditPolicyButton({ policy, insurers }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await updatePolicy(formData);
        setOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("No se pudo actualizar la póliza");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Editar
      </button>

      <GndModal
        open={open}
        title="Editar póliza"
        onClose={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      >
        <form action={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={policy.id} />

          <input name="policyNumber" defaultValue={policy.policyNumber} placeholder="Número de póliza" className="rounded-lg border px-3 py-2 text-sm" required disabled={pending} />
          <input name="branch" defaultValue={policy.branch ?? ""} placeholder="Ramo" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="insuredName" defaultValue={policy.insuredName ?? ""} placeholder="Asegurado" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select name="policyType" defaultValue={policy.policyType ?? ""} className="rounded-lg border px-3 py-2 text-sm" disabled={pending}>
            <option value="">Tipo de póliza</option>
            <option value="MAESTRA">Maestra</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COLECTIVA">Colectiva</option>
            <option value="FLOTILLA">Flotilla</option>
            <option value="FAM_GTZ">Fam. Gtz.</option>
          </select>

          <select name="status" defaultValue={policy.status} className="rounded-lg border px-3 py-2 text-sm" disabled={pending}>
            <option value="ACTIVA">Activa</option>
            <option value="POR_VENCER">Por vencer</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="HISTORICO">Histórico</option>
          </select>

          <input name="startDate" type="date" defaultValue={toDateInputValue(policy.startDate)} className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="endDate" type="date" defaultValue={toDateInputValue(policy.endDate)} className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="siteManager" defaultValue={policy.siteManager ?? ""} placeholder="Responsable en sitio" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select name="insurerId" defaultValue={policy.insurerId} className="rounded-lg border px-3 py-2 text-sm" required disabled={pending}>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>

          <input name="paymentMethod" defaultValue={policy.paymentMethod ?? ""} placeholder="Forma de pago" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerName" defaultValue={policy.brokerName ?? ""} placeholder="Broker - nombre" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerContact" defaultValue={policy.brokerContact ?? ""} placeholder="Broker - contacto" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerEmail" defaultValue={policy.brokerEmail ?? ""} placeholder="Broker - correo electrónico" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="brokerPhone" defaultValue={policy.brokerPhone ?? ""} placeholder="Broker - celular" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <select name="currency" defaultValue={policy.currency ?? "MXN"} className="rounded-lg border px-3 py-2 text-sm" disabled={pending}>
            <option value="MXN">Pesos</option>
            <option value="USD">Dólares</option>
          </select>

          <input name="policyCost" type="number" step="0.01" defaultValue={decimalToString(policy.policyCost)} placeholder="Costo" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="issuanceCost" type="number" step="0.01" defaultValue={decimalToString(policy.issuanceCost)} placeholder="Costo emisión póliza" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="vat" type="number" step="0.01" defaultValue={decimalToString(policy.vat)} placeholder="IVA" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />
          <input name="grandTotal" type="number" step="0.01" defaultValue={decimalToString(policy.grandTotal)} placeholder="Gran total" className="rounded-lg border px-3 py-2 text-sm" disabled={pending} />

          <textarea
            name="notes"
            defaultValue={policy.notes ?? ""}
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