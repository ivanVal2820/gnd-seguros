import { prisma } from "@/lib/prisma";
import NewInsurerButton from "./NewInsurerButton";
import DeleteInsurerButton from "./DeleteInsurerButton";
import EditInsurerButton from "./EditInsurerButton";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AseguradorasPage() {
  await requireUser();
  const insurers = await prisma.insurer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Aseguradoras</h1>
          <p className="text-sm text-gray-600">
            Catálogo base de aseguradoras registradas en GND Seguros.
          </p>
        </div>

        <NewInsurerButton />
      </div>

      

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Estatus</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insurers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay aseguradoras registradas todavía.
                </td>
              </tr>
            ) : (
              insurers.map((insurer) => (
                <tr key={insurer.id} className="border-t border-gray-100 text-sm text-gray-800">
  <td className="px-4 py-3">{insurer.name}</td>
  <td className="px-4 py-3">{insurer.code ?? "-"}</td>
  <td className="px-4 py-3">
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        insurer.isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {insurer.isActive ? "Activa" : "Inactiva"}
    </span>
  </td>
  <td className="px-4 py-3">
    {new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
    }).format(insurer.createdAt)}
  </td>
  <td className="px-4 py-3">
    <div className="flex gap-2">
      <EditInsurerButton insurer={insurer} />
      <DeleteInsurerButton id={insurer.id} name={insurer.name} />
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