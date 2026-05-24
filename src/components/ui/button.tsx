"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gold text-black hover:bg-gold-light active:bg-gold-dark":
              variant === "primary",
            "bg-white text-black hover:bg-cream active:bg-cream-dark":
              variant === "secondary",
            "border border-gold/30 text-gold hover:border-gold hover:bg-gold/5":
              variant === "outline",
            "text-white/70 hover:text-white hover:bg-white/5":
              variant === "ghost",
            "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:shadow-[0_0_30px_rgba(201,169,110,0.3)]":
              variant === "gold",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-8 py-4 text-sm": size === "lg",
            "px-10 py-5 text-base": size === "xl",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        ) : null}
        <span className={cn(loading && "invisible")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
