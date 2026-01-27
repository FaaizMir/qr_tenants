import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from "@/lib/utils";

export function TextField({
  label,
  name,
  placeholder,
  register,
  errors,
  validation = {},
  startIcon,
  className,
  inputClassName, // Destructure this so it doesn't leak to DOM
  ...props
}) {
  // Check if field is required
  const isRequired = validation?.required;

  return (
    <div className={cn("mb-4", className)}>
      <Label className="mb-2" htmlFor={name}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
            {React.cloneElement(startIcon, { className: cn("h-4 w-4", startIcon.props?.className) })}
          </div>
        )}
        <Input
          type="text"
          id={name}
          placeholder={placeholder}
          {...register(name, validation)}
          className={cn(startIcon && "pl-10", inputClassName)}
          {...props}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}
