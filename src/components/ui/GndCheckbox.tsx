"use client";

import { InputHTMLAttributes, ReactNode } from "react";

export default function GndCheckbox({
  checked,
  onChange,
  label,
  hint,
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label
      className={[
        "flex items-start gap-3 rounded-xl border border-slate-200 bg-[#e5e5e0] p-3",
        className,
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={[
          "mt-0.5 h-4 w-4 rounded border-slate-400",
          "accent-[#183752]",
          "focus:outline-none focus:ring-2 focus:ring-[#bccee1] focus:ring-offset-2 focus:ring-offset-[#e5e5e0]",
        ].join(" ")}
        {...props}
      />

      <div className="text-sm text-slate-900">
        <div className="font-medium">{label}</div>
        {hint ? <div className="text-slate-600">{hint}</div> : null}
      </div>
    </label>
  );
}
