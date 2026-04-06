import { ReactNode } from "react";

type Variant = "danger" | "warning" | "info" | "neutral";

const styles: Record<Variant, string> = {
  danger: "bg-rose-50 text-rose-900 border-rose-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  info: "bg-sky-50 text-sky-900 border-sky-200",
  neutral: "bg-slate-50 text-slate-800 border-slate-200",
};

export default function GndChip({
  children,
  variant = "neutral",
  title,
}: {
  children: ReactNode;
  variant?: Variant;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={[
        "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
