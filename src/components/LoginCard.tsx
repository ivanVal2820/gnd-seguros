"use client";

import { withBase } from "@/lib/basePath";
import { signIn } from "next-auth/react";

export default function LoginCard() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#043230] px-6 py-5 text-white">
        <div className="mb-3 flex justify-center">
          <img
            src={withBase("/brand/ico1.png")}
            alt="GND"
            className="h-12 w-12 object-contain"
          />
        </div>

        <div className="text-lg font-semibold tracking-wide">GND Contratos</div>
        <div className="mt-1 text-sm text-white/80">
          Administración de contratos • GND Properties
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="text-sm text-slate-700">
          Inicia sesión con tu cuenta institucional para continuar.
        </div>

        <button
          type="button"
          className="w-full rounded-md bg-[#183752] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          onClick={() =>
            signIn("azure-ad", {
              callbackUrl: "/seguros/polizas",
            })
          }
        >
          Ingresar con Microsoft
        </button>

        <div className="text-xs text-slate-500">
          Acceso permitido: cuentas{" "}
          <span className="font-medium">@gndproperties.mx</span>
        </div>
      </div>
    </div>
  );
}