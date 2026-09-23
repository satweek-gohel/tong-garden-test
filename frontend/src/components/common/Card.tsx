import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "outlined", className, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-surface",
      elevated: "bg-surface shadow-[0_24px_48px_-24px_rgba(20,21,26,0.14)]",
      outlined: "bg-surface border border-line",
    };

    return (
      <div ref={ref} className={clsx("rounded-2xl p-6", variantStyles[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
