import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue text-white border border-blue hover:bg-navy hover:border-navy",
  secondary:
    "bg-white text-navy border border-[rgba(73,136,196,0.3)] hover:border-mid hover:bg-sky/30",
  ghost: "bg-transparent text-mid border border-transparent hover:bg-sky/40 hover:text-navy",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2 text-[14px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center gap-1.5 rounded-input font-normal transition-colors",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
