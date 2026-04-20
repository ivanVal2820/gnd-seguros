import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AppRole = "SUPERADMIN" | "USER";

export async function requireSessionEmail() {
  const session = await auth();
  const email =
    typeof session?.user?.email === "string"
      ? session.user.email.toLowerCase()
      : null;

  if (!email) return { ok: false as const, status: 401 as const };
  return { ok: true as const, email };
}

export async function requireUser() {
  const s = await requireSessionEmail();
  if (!s.ok) return s;

  const user = await prisma.user.findUnique({
    where: { email: s.email },
  });

  if (!user) return { ok: false as const, status: 401 as const };
  if (!user.isActive) return { ok: false as const, status: 403 as const };

  return { ok: true as const, email: s.email, user };
}

export async function requireRole(roles: AppRole[]) {
  const s = await requireUser();
  if (!s.ok) return s;

  if (!roles.includes(s.user.role as AppRole)) {
    return { ok: false as const, status: 403 as const };
  }

  return s;
}