import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TextareaField({
  label,
  name,
  placeholder,
  register,
  errors,
  validation = {},
  rows = 4,
  className,
  ...props
}) {
  const defaultPlaceholder =
    placeholder || `Enter ${label?.toLowerCase() || "text"}`;

  return (
    <div className="mb-4">
      <Label className="mb-2" htmlFor={name}>
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <textarea
        id={name}
        rows={rows}
        placeholder={defaultPlaceholder}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...register(name, validation)}
        {...props}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}

