import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { graphSendMail } from "../lib/graph";

function parseDateOnlyFromIso(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function getToday() {
  const forced = process.env.WORKER_TODAY;
  if (forced) return parseDateOnlyFromIso(forced);

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function diffDays(end: Date, today: Date) {
  const end0 = parseDateOnlyFromIso(end.toISOString());
  const ms = end0.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

type NotifyType = "D90" | "D30" | "D7" | "D1" | "EXPIRED";

const TARGETS: Array<{ days: number; type: NotifyType }> = [
  { days: 90, type: "D90" },
  { days: 30, type: "D30" },
  { days: 7, type: "D7" },
  { days: 1, type: "D1" },
];

function subjectFor(type: NotifyType, policyNumber: string) {
  const label =
    type === "EXPIRED"
      ? "Aviso de vencimiento (VENCIDA)"
      : type === "D1"
      ? "Aviso de vencimiento (1 día)"
      : type === "D7"
      ? "Aviso de vencimiento (7 días)"
      : type === "D30"
      ? "Aviso de vencimiento (30 días)"
      : "Aviso de vencimiento (90 días)";

  return `[GND Seguros] ${label} – Póliza ${policyNumber}`;
}

function formatDateYmd(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function emailTemplate(opts: {
  type: NotifyType;
  policyNumber: string;
  insurerName: string;
  insuredName: string;
  daysLeft: number;
  endDateYmd: string;
  appUrl?: string;
}) {
  const { type, policyNumber, insurerName, insuredName, daysLeft, endDateYmd, appUrl } = opts;

  const title =
    type === "EXPIRED"
      ? "Póliza vencida"
      : `Vencimiento próximo (${daysLeft} ${daysLeft === 1 ? "día" : "días"})`;

  const badge =
    type === "EXPIRED"
      ? `<span style="background:#fee2e2;color:#991b1b;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">VENCIDA</span>`
      : `<span style="background:#fef3c7;color:#92400e;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">${daysLeft} ${daysLeft === 1 ? "día" : "días"}</span>`;

  const linkHtml = appUrl
    ? `<p style="margin:16px 0 0;">
         <a href="${appUrl}" style="display:inline-block;background:#043230;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600;font-size:14px;">
           Abrir GND Seguros
         </a>
       </p>`
    : "";

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; color:#0f172a; line-height:1.4;">
    <div style="max-width:640px;margin:0 auto;padding:20px;">
      <div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:#043230;padding:16px 18px;color:white;">
          <div style="font-size:14px;opacity:.9;">GND Properties</div>
          <div style="font-size:18px;font-weight:700;margin-top:2px;">GND Seguros</div>
        </div>

        <div style="padding:18px;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div style="font-size:16px;font-weight:700;">${title}</div>
            ${badge}
          </div>

          <div style="margin-top:14px;font-size:14px;">
            <p style="margin:0 0 10px;">Se notifica el estatus de la siguiente póliza:</p>

            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px;background:#f8fafc;">
              <div style="margin:0 0 6px;"><b>Póliza:</b> ${policyNumber}</div>
              <div style="margin:0 0 6px;"><b>Aseguradora:</b> ${insurerName}</div>
              <div style="margin:0 0 6px;"><b>Asegurado:</b> ${insuredName || "-"}</div>
              <div style="margin:0;"><b>Fecha de vencimiento:</b> ${formatDateYmd(endDateYmd)}</div>
            </div>

            ${
              type !== "EXPIRED"
                ? `<p style="margin:12px 0 0;">Días restantes: <b>${daysLeft}</b></p>`
                : ""
            }

            ${linkHtml}

            <p style="margin:16px 0 0;color:#475569;font-size:12px;">
              Este es un correo automático de GND Seguros.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

async function createLogOnce(prisma: PrismaClient, policyId: string, type: NotifyType, sentTo: string) {
  try {
    await prisma.policyNotificationLog.create({
      data: {
        policyId,
        type,
        sentTo,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const noEmail = args.has("--no-email");

  const today = getToday();

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const fromUpn = process.env.MAIL_FROM_UPN!;
  const overrideTo = process.env.MAIL_OVERRIDE_TO || "";
  const appUrl = process.env.APP_URL || "";

  if (!fromUpn) throw new Error("MAIL_FROM_UPN no definido");

  const [policies, users] = await Promise.all([
    prisma.policy.findMany({
      where: {
        endDate: { not: null },
        status: { in: ["ACTIVA", "POR_VENCER", "VENCIDO"] },
      },
      include: {
        insurer: true,
      },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { email: true },
    }),
  ]);

  console.log(`Pólizas evaluadas: ${policies.length}`);

  let processed = 0;

  for (const p of policies) {
    if (!p.endDate) continue;

    const daysLeft = diffDays(p.endDate, today);

    const matchingTargets = TARGETS.filter((t) => t.days === daysLeft);

    let typesToSend: NotifyType[] = [];

    if (daysLeft < 0) {
      typesToSend = ["EXPIRED"];
    } else {
      typesToSend = matchingTargets.map((t) => t.type);
    }

    if (typesToSend.length === 0) continue;

    for (const type of typesToSend) {
      for (const user of users) {
        const email = (overrideTo || user.email).toLowerCase();

        console.log(`[${type}] ${p.policyNumber} -> ${email}`);

        if (!apply) continue;

        const created = await createLogOnce(prisma, p.id, type, email);
        if (!created) continue;

        if (!noEmail) {
          try {
            await graphSendMail({
              fromUpn,
              to: [email],
              subject: subjectFor(type, p.policyNumber),
              html: emailTemplate({
                type,
                policyNumber: p.policyNumber,
                insurerName: p.insurer.name,
                insuredName: p.insuredName ?? "",
                daysLeft,
                endDateYmd: p.endDate.toISOString(),
                appUrl: appUrl || undefined,
              }),
            });
          } catch (e) {
            console.error(`Error enviando ${type} para ${p.policyNumber} a ${email}:`, e);
          }
        }

        processed++;
      }
    }
  }

  console.log(`Procesados: ${processed}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});