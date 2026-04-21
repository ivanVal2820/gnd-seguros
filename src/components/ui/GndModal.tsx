"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function GndModal({ open, title, children, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}