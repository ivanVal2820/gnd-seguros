"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMemo } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { withBase } from "@/lib/basePath";

type Role = "USER" | "LEGAL_ADMIN" | "SUPERADMIN";

type Props = {
  user: {
    email: string;
    name?: string;
    image?: string;
    role: Role;
  };
  children: React.ReactNode;
};

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function initials(nameOrEmail: string) {
  const s = (nameOrEmail ?? "").trim();
  if (!s) return "U";
  const parts = s.includes("@") ? s.split("@")[0].split(".") : s.split(" ");
  const a = (parts[0]?.[0] ?? "U").toUpperCase();
  const b = (parts[1]?.[0] ?? "").toUpperCase();
  return a + b;
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={classNames(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-[#183752] text-white" : "text-white hover:bg-white/10"
      )}
    >
      {label}
    </Link>
  );
}

export default function ProtectedShell({ user, children }: Props) {
  const pathname = usePathname();

const links = useMemo(() => {
  const base = [
    { href: "/", label: "Inicio" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/polizas", label: "Pólizas" },
    { href: "/aseguradoras", label: "Aseguradoras" },
    { href: "/licitaciones", label: "Licitaciones" },
    { href: "/admin/catalogos", label: "Catálogos" },
  ];

  if (user.role === "SUPERADMIN") {
    base.push({ href: "/admin/usuarios", label: "Usuarios" });
  }

  return base;
}, [user.role]);

  const displayName = user.name?.trim() ? user.name.trim() : user.email;

  function isActive(href: string) {
    const exactOrChild = pathname === href || pathname.startsWith(href + "/");

    if (href === "/polizas" && pathname.startsWith("/polizas/calendario")) return false;

    return exactOrChild;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-[#043230] text-white shadow-md">
        {/* ===== Top row: brand + nav + user ===== */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <img src={withBase("/brand/ico1.png")} alt="GND" className="h-9 w-9 object-contain" />
            <div className="min-w-0 leading-tight">
              <div className="truncate font-semibold tracking-wide text-white">GND Seguros</div>
              <div className="truncate text-xs text-white/70">Administración de Seguros</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs opacity-70">{user.email}</div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">{initials(displayName)}</span>
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/seguros/login" })}
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ===== Breadcrumbs row (desktop + mobile) ===== */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-2">
            <Breadcrumbs />
          </div>
        </div>

        {/* ===== Mobile nav ===== */}
        <div className="border-t border-white/10 md:hidden">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                active={pathname === l.href || pathname.startsWith(l.href + "/")}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
      </main>
    </div>
  );
}