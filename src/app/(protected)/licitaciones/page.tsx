import { prisma } from "@/lib/prisma";
import NewTenderButton from "./NewTenderButton";
import DeleteTenderButton from "./DeleteTenderButton";
import ReplaceTenderFileButton from "./ReplaceTenderFileButton";
import EditTenderButton from "./EditTenderButton";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  year?: string;
  q?: string;
}>;

export default async function LicitacionesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
    await requireUser();
  const params = await searchParams;

  const year = params.year?.trim() || "";
  const q = params.q?.trim() || "";

  const where = {
    ...(year ? { year: Number(year) } : {}),
    ...(q
      ? {
          title: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [tenders, years] = await Promise.all([
    prisma.tender.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    }),
    prisma.tender.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);

  const grouped = Object.entries(
    tenders.reduce<Record<string, typeof tenders>>((acc, tender) => {
      const key = String(tender.year);
      if (!acc[key]) acc[key] = [];
      acc[key].push(tender);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Licitaciones</h1>
          <p className="text-sm text-gray-600">
            Gestión de PDFs de licitaciones por año.
          </p>
        </div>

        <NewTenderButton />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Año
            </label>
            <select
              name="year"
              defaultValue={year}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {years.map((item) => (
                <option key={item.year} value={item.year}>
                  {item.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Buscar por título
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Ej. Licitación 2026"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
            >
              Filtrar
            </button>

            <a
              href="/seguros/licitaciones"
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </a>
          </div>
        </form>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No hay licitaciones que coincidan con el filtro.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([groupYear, items]) => (
            <div key={groupYear} className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">{groupYear}</h2>

              <div className="space-y-3">
                {items.map((tender) => (
                  <div
                    key={tender.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tender.title}
                        </h3>

                        <div className="text-sm text-gray-600">
                          {tender.description || "Sin descripción"}
                        </div>

                        <div className="text-sm text-gray-500">
                          Archivo:{" "}
                          <span className="font-medium text-gray-700">
                            {tender.originalName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/seguros/licitaciones/files/${tender.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Ver / Descargar
                        </a>

                        <EditTenderButton tender={tender} />

                        <ReplaceTenderFileButton
                          tenderId={tender.id}
                          title={tender.title}
                        />

                        <DeleteTenderButton
                          tenderId={tender.id}
                          title={tender.title}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}