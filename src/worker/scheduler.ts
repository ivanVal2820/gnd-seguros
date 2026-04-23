import cron from "node-cron";
import { syncPolicyStatuses } from "./syncPolicyStatuses";
import { spawn } from "child_process";

const SCHEDULE = "5 0 * * *"; // diario 00:05

async function runStatusJob() {
  console.log("[scheduler] Ejecutando syncPolicyStatuses...");
  try {
    const count = await syncPolicyStatuses();
    console.log(`[scheduler] Status actualizado: ${count}`);
  } catch (e) {
    console.error("[scheduler] Error en status:", e);
  }
}

async function runNotificationJob() {
  console.log("[scheduler] Ejecutando notifyPolicies...");

  return new Promise<void>((resolve) => {
    const proc = spawn("npm", ["run", "worker:notify-policies", "--", "--apply"], {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });

    proc.on("close", (code) => {
      console.log(`[scheduler] notifyPolicies terminó con código ${code}`);
      resolve();
    });
  });
}

async function runAll() {
  console.log("[scheduler] === Inicio ciclo ===");

  await runStatusJob();
  await runNotificationJob();

  console.log("[scheduler] === Fin ciclo ===");
}

console.log(`[scheduler] Iniciado con cron: ${SCHEDULE}`);

// correr al iniciar (muy útil)
runAll();

// programado diario
cron.schedule(SCHEDULE, async () => {
  await runAll();
});