import React from "react";
import clsx from "clsx";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          "w-full px-3.5 py-2.5 border rounded-[10px] bg-[#FBFAF7] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-offset-0",
          error ? "border-danger focus:ring-danger" : "border-line focus:ring-primary",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      {!error && hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  )
);

TextInput.displayName = "TextInput";
