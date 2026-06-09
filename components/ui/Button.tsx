"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-light shadow-lg shadow-gold/20 disabled:opacity-40",
  secondary:
    "border border-gold/40 text-gold hover:bg-gold/10 disabled:opacity-40",
  ghost: "text-cream/70 hover:text-cream hover:bg-white/5 disabled:opacity-40",
  danger:
    "border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40",
};

const sizes: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-4 text-lg font-semibold tracking-wide",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", children, ...props },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: props.disabled ? 1 : 1.02 }}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-display transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
