import { ReactNode } from "react";

type Variant = "success" | "error" | "info";

const styles: Record<Variant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-slate-50 text-slate-900",
};

export default function GndAlert({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <div className={["rounded-xl border p-3 text-sm", styles[variant]].join(" ")}>
      {children}
    </div>
  );
}
