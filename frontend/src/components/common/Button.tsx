import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, fullWidth = false, children, className, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-primary text-[#F5F3EE] hover:bg-primary-dark",
      secondary: "bg-primary-soft text-primary hover:bg-primary-soft/70",
      danger: "bg-danger text-white hover:bg-danger/90",
      ghost: "bg-transparent text-ink hover:bg-black/5",
      outline: "bg-surface text-ink border border-line hover:border-ink/30",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm font-medium",
      md: "px-4 py-2.5 text-sm font-semibold",
      lg: "px-6 py-3 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-[10px] font-sans transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          (isLoading || disabled) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {isLoading && <span className="animate-spin">⏳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
