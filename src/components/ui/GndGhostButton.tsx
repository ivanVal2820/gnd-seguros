import { ButtonHTMLAttributes } from "react";

export default function GndGhostButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium",
        "text-[#043230] border border-[#043230]/30",
        "transition-colors hover:bg-[#043230]/10",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
