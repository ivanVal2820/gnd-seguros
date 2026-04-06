import { ReactNode } from "react";

type Variant = "success" | "danger" | "warning" | "info" | "neutral";

const styles: Record<Variant, string> = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  danger: "bg-rose-50 text-rose-800 border-rose-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function GndBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
