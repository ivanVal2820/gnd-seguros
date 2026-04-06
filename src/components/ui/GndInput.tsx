import { InputHTMLAttributes } from "react";

export default function GndInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`
        w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900
        outline-none transition
        focus:border-[#183752]
        focus:ring-2 focus:ring-[#bccee1]
        ${className}
      `}
    />
  );
}
