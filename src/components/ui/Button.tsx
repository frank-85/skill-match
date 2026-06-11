import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

const VARIANT_CLASS: Record<string, string> = {
  primary: "bg-gold text-navy-deep hover:bg-gold-soft active:scale-[0.98]",
  secondary: "bg-navy-deep text-bg hover:bg-navy-medium active:scale-[0.98]",
  ghost: "bg-transparent text-navy-deep hover:bg-gold-soft",
};

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
