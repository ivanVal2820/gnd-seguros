"use client";

import { withBase } from "@/lib/basePath";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function isIdSegment(seg: string) {
  // CUID típico de Prisma (ej: cmlieqnf50006s8jqvw9eexxl) o ids largos
  return seg.length >= 16 && /^[a-z0-9]+$/i.test(seg);
}

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  contracts: "Contratos",
  calendar: "Calendario",
  projects: "Proyectos",
  admin: "Admin",
};

function baseLabelFor(seg: string) {
  if (LABELS[seg]) return LABELS[seg];
  if (isIdSegment(seg)) return "Detalle";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

type NameMap = Record<string, string>; // id -> name

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = useMemo(
    () => pathname.split("?")[0].split("#")[0].split("/").filter(Boolean),
    [pathname]
  );

  const [names, setNames] = useState<NameMap>({});

  // Armamos crumbs acumulativos
  const crumbs = useMemo(() => {
    return parts.map((seg, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      return { seg, href, idx };
    });
  }, [parts]);

  // Resolver nombres para IDs conocidos (projects/:id, contracts/:id)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function resolveOne(resource: "projects" | "contracts", id: string) {
      // Ya resuelto
      if (names[id]) return;

      try {
        if (resource === "projects") {
          const res = await fetch(withBase(`/api/projects/${id}`), {
            cache: "no-store",
            signal: controller.signal,
          });
          const data = await res.json().catch(() => null);
          if (!alive) return;
          if (res.ok && data?.name) {
            setNames((prev) => ({ ...prev, [id]: String(data.name) }));
          }
          return;
        }

        if (resource === "contracts") {
          const res = await fetch(withBase(`/api/contracts/${id}`), {
            cache: "no-store",
            signal: controller.signal,
          });
          const data = await res.json().catch(() => null);
          if (!alive) return;

          // Intentamos varios posibles nombres según tu API
          const label =
            data?.contractNumber ??
            data?.number ??
            data?.title ??
            null;

          if (res.ok && label) {
            setNames((prev) => ({ ...prev, [id]: String(label) }));
          }
        }
      } catch {
        // silencioso
      }
    }

    async function run() {
      // Buscamos patrones: /projects/:id y /contracts/:id
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        const next = parts[i + 1];

        if ((seg === "projects" || seg === "contracts") && isIdSegment(next)) {
          await resolveOne(seg, next);
        }
      }
    }

    run();

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.join("|")]); // re-eval cuando cambie ruta

  if (parts.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-white/80">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Inicio
          </Link>
        </li>

        {crumbs.map((c, idx) => {
          const last = idx === crumbs.length - 1;

          // Label “bonito”
          let label = baseLabelFor(c.seg);

          // Si es ID y tenemos nombre resuelto, úsalo
          if (isIdSegment(c.seg) && names[c.seg]) {
            label = names[c.seg];
          }

          return (
            <li key={c.href} className="flex items-center gap-1">
              <span className="opacity-60">/</span>

              {last ? (
                <span className="font-medium text-white">{label}</span>
              ) : (
                <Link href={c.href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
