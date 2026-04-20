"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-gray-600">
          Accede con tu cuenta de Microsoft de GND Properties.
        </p>

        <button
          type="button"
          onClick={() => signIn("azure-ad", { callbackUrl: "/seguros/polizas" })}
          className="mt-6 w-full rounded-lg bg-[#043230] px-4 py-2 text-sm font-medium text-white"
        >
          Entrar con Microsoft
        </button>
      </div>
    </div>
  );
}