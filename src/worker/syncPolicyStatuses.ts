import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function syncPolicyStatuses() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const today = startOfToday();
    const threshold = addDays(today, 90);

    const candidates = await prisma.policy.findMany({
      where: {
        endDate: {
          not: null,
        },
        status: {
          in: ["ACTIVA", "POR_VENCER", "VENCIDO"],
        },
      },
      select: {
        id: true,
        status: true,
        endDate: true,
        policyNumber: true,
      },
    });

    let updatedCount = 0;

    for (const policy of candidates) {
      if (!policy.endDate) continue;

      const endDate = new Date(policy.endDate);
      let nextStatus: "ACTIVA" | "POR_VENCER" | "VENCIDO";

      if (endDate < today) {
        nextStatus = "VENCIDO";
      } else if (endDate <= threshold) {
        nextStatus = "POR_VENCER";
      } else {
        nextStatus = "ACTIVA";
      }

      if (policy.status !== nextStatus) {
        await prisma.policy.update({
          where: { id: policy.id },
          data: { status: nextStatus },
        });

        updatedCount++;

        console.log(
          `[policy-status] ${policy.policyNumber} -> ${policy.status} => ${nextStatus}`
        );
      }
    }

    console.log(`[policy-status] Pólizas actualizadas: ${updatedCount}`);
    return updatedCount;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await syncPolicyStatuses();
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error actualizando estatus de pólizas:", error);
    process.exit(1);
  });
}