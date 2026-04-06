import { prisma } from "@/lib/prisma";

export type AppRole = "USER" | "LEGAL_ADMIN" | "SUPERADMIN";

type RequireUserResult =
  | {
      ok: true;
      email: string;
      role: AppRole;
      name?: string | null;
    }
  | {
      ok: false;
      status: 401 | 403;
    };

const DEMO_EMAIL = "demo@gndproperties.mx";

function isAppRole(value: string): value is AppRole {
  return value === "USER" || value === "LEGAL_ADMIN" || value === "SUPERADMIN";
}

export async function requireUser(): Promise<RequireUserResult> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!user) {
    return { ok: false, status: 401 };
  }

  if (!isAppRole(user.role)) {
    return { ok: false, status: 403 };
  }

  return {
    ok: true,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireRole(roles: AppRole[]): Promise<RequireUserResult> {
  const userResult = await requireUser();
  if (!userResult.ok) return userResult;

  if (!roles.includes(userResult.role)) {
    return { ok: false, status: 403 };
  }

  return userResult;
}