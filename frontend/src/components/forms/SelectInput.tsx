import React from "react";
import clsx from "clsx";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, options, placeholder, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={clsx(
          "w-full px-3.5 py-2.5 border rounded-[10px] border-line bg-[#FBFAF7] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
);

SelectInput.displayName = "SelectInput";
