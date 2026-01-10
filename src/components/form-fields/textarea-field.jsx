import React from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TextareaField({
  label,
  name,
  placeholder,
  control,
  errors,
  rules = {},
  rows = 4,
  className,
}) {
  const defaultPlaceholder =
    placeholder || `Enter ${label?.toLowerCase() || "text"}`;

  return (
    <div className="mb-4">
      <Label className="mb-2" htmlFor={name}>
        {label}
        {rules?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={defaultPlaceholder}
            className={className}
          />
        )}
      />

      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}
