"use client";

type GndModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function GndModal({
  open,
  title,
  onClose,
  children,
}: GndModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}