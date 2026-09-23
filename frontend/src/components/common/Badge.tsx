import React from "react";
import clsx from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-primary-soft text-primary",
      success: "bg-success-soft text-success",
      warning: "bg-accent-soft text-accent",
      danger: "bg-danger-soft text-danger",
      info: "bg-info-soft text-info",
    };

    return (
      <span
        ref={ref}
        className={clsx("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
