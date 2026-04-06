import { ButtonHTMLAttributes } from "react";

export default function GndButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`
        rounded-md bg-[#043230] px-4 py-2 text-sm font-medium text-white
        shadow-sm transition-colors
        hover:bg-[#183752]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
