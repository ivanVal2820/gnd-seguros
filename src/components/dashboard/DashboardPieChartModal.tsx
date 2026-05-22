"use client";

import { useMemo, useState } from "react";
import GndModal from "@/components/ui/GndModal";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Policy = {
  status: string | null;
  branch: string | null;
};

type Props = {
  policies: Policy[];
};

const COLORS = [
  "#043230",
  "#0F766E",
  "#0EA5E9",
  "#6366F1",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
];

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVA":
      return "Activa";
    case "POR_VENCER":
      return "Por vencer";
    case "EN_PROCESO":
      return "En proceso";
    case "VENCIDO":
      return "Vencido";
    case "HISTORICO":
      return "Histórico";
    default:
      return status || "Sin estatus";
  }
}

export default function DashboardPieChartModal({ policies }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"status" | "branch">("status");

  const data = useMemo(() => {
    const map = new Map<string, number>();

    for (const policy of policies) {
      const raw =
        mode === "status"
          ? policy.status || "Sin estatus"
          : policy.branch || "Sin ramo";

      const key = mode === "status" ? statusLabel(raw) : raw;

      map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [mode, policies]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Ver gráfico
      </button>

      <GndModal
        open={open}
        title="Distribución de pólizas"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600">
              Visualización agrupada por estatus o ramo.
            </p>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "status" | "branch")}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="status">Estatus</option>
              <option value="branch">Ramo</option>
            </select>
          </div>

          {data.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No hay pólizas para graficar.
            </div>
          ) : (
            <div className="h-[420px] rounded-xl border bg-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={140}
                    label
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </GndModal>
    </>
  );
}