import { prisma } from "@/lib/prisma";
import NewPolicyButton from "./NewPolicyButton";
import PolicyAccordionItem from "./PolicyAccordionItem";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  insurerId?: string;
  branch?: string;
}>;

export default async function PolizasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
    await requireUser();
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const status = params.status?.trim() || "";
  const insurerId = params.insurerId?.trim() || "";
  const branch = params.branch?.trim() || "";

  const where = {
    ...(status ? { status } : {}),
    ...(insurerId ? { insurerId } : {}),
    ...(branch ? { branch } : {}),
    ...(q
      ? {
          OR: [
            {
              policyNumber: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              insuredName: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [policies, insurers, branches, policyTypes, paymentMethods] = await Promise.all([
    prisma.policy.findMany({
      where,
      include: { insurer: true, attachments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.insurer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.catalogItem.findMany({
      where: { category: "POLICY_BRANCH", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.catalogItem.findMany({
      where: { category: "POLICY_TYPE", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.catalogItem.findMany({
      where: { category: "PAYMENT_METHOD", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
  ]);

  const serializedPolicies = policies.map((policy) => ({
  ...policy,
  policyCost: policy.policyCost ? policy.policyCost.toString() : null,
  issuanceCost: policy.issuanceCost ? policy.issuanceCost.toString() : null,
  vat: policy.vat ? policy.vat.toString() : null,
  grandTotal: policy.grandTotal ? policy.grandTotal.toString() : null,
}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pólizas</h1>
          <p className="text-sm text-gray-600">
            Administración base de pólizas en GND Seguros.
          </p>
        </div>

        <NewPolicyButton
          insurers={insurers}
          branches={branches}
          policyTypes={policyTypes}
          paymentMethods={paymentMethods}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Número de póliza o asegurado"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estatus
            </label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="ACTIVA">Activa</option>
              <option value="POR_VENCER">Por vencer</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="VENCIDO">Vencido</option>
              <option value="HISTORICO">Histórico</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Aseguradora
            </label>
            <select
              name="insurerId"
              defaultValue={insurerId}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {insurers.map((insurer) => (
                <option key={insurer.id} value={insurer.id}>
                  {insurer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ramo
            </label>
            <select
              name="branch"
              defaultValue={branch}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {branches.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
            >
              Filtrar
            </button>

            <a
              href="/seguros/polizas"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </a>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {policies.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            No hay pólizas que coincidan con el filtro.
          </div>
        ) : (
          serializedPolicies.map((policy) => (
            <PolicyAccordionItem
              key={policy.id}
              policy={policy}
              insurers={insurers}
              branches={branches}
              policyTypes={policyTypes}
              paymentMethods={paymentMethods}
            />
          ))
        )}
      </div>
    </div>
  );
}