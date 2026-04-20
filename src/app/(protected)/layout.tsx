import ProtectedShell from "@/components/ProtectedShell";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await requireUser();

  if (!result.ok) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión con una cuenta autorizada de GND Properties.
          </p>
          <a
            href="/seguros/login"
            className="mt-4 inline-flex rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
          >
            Ir a login
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProtectedShell
      user={{
        email: result.user.email,
        name: result.user.name ?? undefined,
        role: result.user.role as "USER" | "SUPERADMIN",
      }}
    >
      {children}
    </ProtectedShell>
  );
}