import ProtectedShell from "@/components/ProtectedShell";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user.ok) {
    return <div>No autorizado</div>;
  }

  return (
    <ProtectedShell
      user={{
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
      }}
    >
      {children}
    </ProtectedShell>
  );
}