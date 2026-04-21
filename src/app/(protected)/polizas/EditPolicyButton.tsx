"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GndModal from "@/components/ui/GndModal";
import { updatePolicy } from "./actions";

type CatalogOption = {
  id: string;
  label: string;
};

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
  branches: CatalogOption[];
  policyTypes: CatalogOption[];
  paymentMethods: CatalogOption[];
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function decimalToString(value: unknown) {
  if (value == null) return "";
  return String(value);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export default function EditPolicyButton({
  policy,
  insurers,
  branches,
  policyTypes,
  paymentMethods,
}: Props) {
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
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={policy.id} />

          <Section title="Datos generales">
            <div>
              <FieldLabel>Número de póliza</FieldLabel>
              <input
                name="policyNumber"
                defaultValue={policy.policyNumber}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Ramo</FieldLabel>
              <select
                name="branch"
                defaultValue={policy.branch ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              >
                <option value="">Selecciona ramo</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Asegurado</FieldLabel>
              <input
                name="insuredName"
                defaultValue={policy.insuredName ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Tipo de póliza</FieldLabel>
              <select
                name="policyType"
                defaultValue={policy.policyType ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              >
                <option value="">Selecciona tipo</option>
                {policyTypes.map((item) => (
                  <option key={item.id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Estatus</FieldLabel>
              <select
                name="status"
                defaultValue={policy.status}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              >
                <option value="ACTIVA">Activa</option>
                <option value="POR_VENCER">Por vencer</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="VENCIDO">Vencido</option>
                <option value="HISTORICO">Histórico</option>
              </select>
            </div>

            <div>
              <FieldLabel>Aseguradora</FieldLabel>
              <select
                name="insurerId"
                defaultValue={policy.insurerId}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
                disabled={pending}
              >
                {insurers.map((insurer) => (
                  <option key={insurer.id} value={insurer.id}>
                    {insurer.name}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          <Section title="Vigencia y operación">
            <div>
              <FieldLabel>Vigencia inicio</FieldLabel>
              <input
                name="startDate"
                type="date"
                defaultValue={toDateInputValue(policy.startDate)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Vigencia término</FieldLabel>
              <input
                name="endDate"
                type="date"
                defaultValue={toDateInputValue(policy.endDate)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Responsable en sitio</FieldLabel>
              <input
                name="siteManager"
                defaultValue={policy.siteManager ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Forma de pago</FieldLabel>
              <select
                name="paymentMethod"
                defaultValue={policy.paymentMethod ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              >
                <option value="">Selecciona forma de pago</option>
                {paymentMethods.map((item) => (
                  <option key={item.id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Moneda</FieldLabel>
              <select
                name="currency"
                defaultValue={policy.currency ?? "MXN"}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              >
                <option value="MXN">Pesos</option>
                <option value="USD">Dólares</option>
              </select>
            </div>
          </Section>

          <Section title="Datos del broker">
            <div>
              <FieldLabel>Broker - nombre</FieldLabel>
              <input
                name="brokerName"
                defaultValue={policy.brokerName ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Broker - contacto</FieldLabel>
              <input
                name="brokerContact"
                defaultValue={policy.brokerContact ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Broker - correo electrónico</FieldLabel>
              <input
                name="brokerEmail"
                type="email"
                defaultValue={policy.brokerEmail ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Broker - celular</FieldLabel>
              <input
                name="brokerPhone"
                defaultValue={policy.brokerPhone ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>
          </Section>

          <Section title="Importes">
            <div>
              <FieldLabel>Costo</FieldLabel>
              <input
                name="policyCost"
                type="number"
                step="0.01"
                defaultValue={decimalToString(policy.policyCost)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Costo emisión póliza</FieldLabel>
              <input
                name="issuanceCost"
                type="number"
                step="0.01"
                defaultValue={decimalToString(policy.issuanceCost)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>IVA</FieldLabel>
              <input
                name="vat"
                type="number"
                step="0.01"
                defaultValue={decimalToString(policy.vat)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>

            <div>
              <FieldLabel>Gran total</FieldLabel>
              <input
                name="grandTotal"
                type="number"
                step="0.01"
                defaultValue={decimalToString(policy.grandTotal)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                disabled={pending}
              />
            </div>
          </Section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <FieldLabel>Notas</FieldLabel>
            <textarea
              name="notes"
              defaultValue={policy.notes ?? ""}
              className="min-h-[110px] w-full rounded-lg border px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t pt-4">
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