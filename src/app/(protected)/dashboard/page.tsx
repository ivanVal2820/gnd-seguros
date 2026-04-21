import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  year?: string;
  month?: string;
}>;

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 7 : day; // lunes=1 ... domingo=7
}

function statusClasses(status: string) {
  switch (status) {
    case "ACTIVA":
      return "bg-green-100 text-green-700 border-green-200";
    case "POR_VENCER":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "VENCIDO":
      return "bg-red-100 text-red-700 border-red-200";
    case "EN_PROCESO":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "HISTORICO":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVA":
      return "Activa";
    case "POR_VENCER":
      return "Por vencer";
    case "VENCIDO":
      return "Vencido";
    case "EN_PROCESO":
      return "En proceso";
    case "HISTORICO":
      return "Histórico";
    default:
      return status;
  }
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function buildMonthNav(year: number, month: number) {
  const current = new Date(year, month - 1, 1);

  const prev = new Date(current);
  prev.setMonth(prev.getMonth() - 1);

  const next = new Date(current);
  next.setMonth(next.getMonth() + 1);

  return {
    prev: {
      year: prev.getFullYear(),
      month: prev.getMonth() + 1,
    },
    next: {
      year: next.getFullYear(),
      month: next.getMonth() + 1,
    },
  };
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const access = await requireUser();
  if (!access.ok) {
    return <div>No autorizado</div>;
  }

  const params = await searchParams;

  const today = new Date();
  const year = Number(params.year) || today.getFullYear();
  const month = Number(params.month) || today.getMonth() + 1;

  const { start, end } = getMonthRange(year, month);

  const policies = await prisma.policy.findMany({
    where: {
      endDate: {
        gte: start,
        lt: end,
      },
    },
    include: {
      insurer: true,
    },
    orderBy: {
      endDate: "asc",
    },
  });

  const policiesByDay = new Map<number, typeof policies>();

  for (const policy of policies) {
    if (!policy.endDate) continue;
    const day = new Date(policy.endDate).getDate();
    if (!policiesByDay.has(day)) {
      policiesByDay.set(day, []);
    }
    policiesByDay.get(day)!.push(policy);
  }

  const totalDays = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const nav = buildMonthNav(year, month);

  const cells: Array<number | null> = [];

  for (let i = 1; i < firstWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const counts = {
    activa: policies.filter((p) => p.status === "ACTIVA").length,
    porVencer: policies.filter((p) => p.status === "POR_VENCER").length,
    vencido: policies.filter((p) => p.status === "VENCIDO").length,
    enProceso: policies.filter((p) => p.status === "EN_PROCESO").length,
    historico: policies.filter((p) => p.status === "HISTORICO").length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Calendario mensual de vencimientos de pólizas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/seguros/dashboard?year=${nav.prev.year}&month=${nav.prev.month}`}
              className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Mes anterior
            </a>

            <div className="rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium capitalize text-white">
              {monthLabel(year, month)}
            </div>

            <a
              href={`/seguros/dashboard?year=${nav.next.year}&month=${nav.next.month}`}
              className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Mes siguiente →
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-green-700">
              Activas
            </div>
            <div className="mt-1 text-xl font-semibold text-green-800">
              {counts.activa}
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-yellow-700">
              Por vencer
            </div>
            <div className="mt-1 text-xl font-semibold text-yellow-800">
              {counts.porVencer}
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-red-700">
              Vencidas
            </div>
            <div className="mt-1 text-xl font-semibold text-red-800">
              {counts.vencido}
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
              En proceso
            </div>
            <div className="mt-1 text-xl font-semibold text-blue-800">
              {counts.enProceso}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-600">
              Históricas
            </div>
            <div className="mt-1 text-xl font-semibold text-gray-800">
              {counts.historico}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex rounded-full border border-green-200 bg-green-100 px-3 py-1 font-medium text-green-700">
            Activa
          </span>
          <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 font-medium text-yellow-700">
            Por vencer
          </span>
          <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-3 py-1 font-medium text-red-700">
            Vencido
          </span>
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-3 py-1 font-medium text-blue-700">
            En proceso
          </span>
          <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-3 py-1 font-medium text-gray-600">
            Histórico
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
        <div className="rounded-lg bg-gray-50 py-2">Lun</div>
        <div className="rounded-lg bg-gray-50 py-2">Mar</div>
        <div className="rounded-lg bg-gray-50 py-2">Mié</div>
        <div className="rounded-lg bg-gray-50 py-2">Jue</div>
        <div className="rounded-lg bg-gray-50 py-2">Vie</div>
        <div className="rounded-lg bg-gray-50 py-2">Sáb</div>
        <div className="rounded-lg bg-gray-50 py-2">Dom</div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
        {cells.map((day, index) => {
          const dayPolicies = day ? policiesByDay.get(day) || [] : [];
          const todayCell = day ? isToday(year, month, day) : false;

          return (
            <div
              key={index}
              className={`min-h-[170px] rounded-2xl border p-3 shadow-sm transition ${
                day
                  ? todayCell
                    ? "border-[#043230] bg-[#f4fbfb]"
                    : "border-gray-200 bg-white"
                  : "border-transparent bg-gray-50"
              }`}
            >
              {day ? (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className={`text-sm font-semibold ${
                        todayCell ? "text-[#043230]" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </div>

                    {dayPolicies.length > 0 ? (
                      <div className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        {dayPolicies.length}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {dayPolicies.map((policy) => (
                      <a
                        key={policy.id}
                        href="/seguros/polizas"
                        className="block rounded-xl border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100"
                      >
                        <div className="truncate text-xs font-semibold text-gray-900">
                          {policy.policyNumber}
                        </div>

                        <div className="truncate text-[11px] text-gray-600">
                          {policy.insurer.name}
                        </div>

                        <div className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium">
                          <span className={statusClasses(policy.status).replace("border-", "")}>
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 ${statusClasses(
                                policy.status
                              )}`}
                            >
                              {statusLabel(policy.status)}
                            </span>
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Resumen del mes</h2>
        <p className="mt-1 text-sm text-gray-600">
          Total de pólizas con vencimiento este mes:{" "}
          <span className="font-semibold text-gray-900">{policies.length}</span>
        </p>
      </div>
    </div>
  );
}