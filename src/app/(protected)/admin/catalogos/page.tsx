import { prisma } from "@/lib/prisma";
import NewCatalogItemButton from "./NewCatalogItemButton";
import EditCatalogItemButton from "./EditCatalogItemButton";
import DeleteCatalogItemButton from "./DeleteCatalogItemButton";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "POLICY_BRANCH", label: "Ramo" },
  { key: "POLICY_TYPE", label: "Tipo de póliza" },
  { key: "PAYMENT_METHOD", label: "Forma de pago" },
] as const;

type SearchParams = Promise<{
  category?: string;
}>;

export default async function CatalogosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = params.category?.trim() || "POLICY_BRANCH";

  const currentCategory =
    CATEGORIES.find((item) => item.key === category) ?? CATEGORIES[0];

  const items = await prisma.catalogItem.findMany({
    where: { category: currentCategory.key },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catálogos</h1>
          <p className="text-sm text-gray-600">
            Administración de catálogos base del sistema.
          </p>
        </div>

        <NewCatalogItemButton category={currentCategory.key} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-[260px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              name="category"
              defaultValue={currentCategory.key}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
          >
            Cambiar
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3 font-medium">Etiqueta</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Estatus</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay elementos registrados en esta categoría.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 text-sm text-gray-800">
                  <td className="px-4 py-3">{item.label}</td>
                  <td className="px-4 py-3">{item.code ?? "-"}</td>
                  <td className="px-4 py-3">{item.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <EditCatalogItemButton item={item} />
                      <DeleteCatalogItemButton id={item.id} label={item.label} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}