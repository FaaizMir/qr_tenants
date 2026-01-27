"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordField({
  label,
  name,
  placeholder,
  register,
  errors,
  validation = {},
  startIcon,
  inputClassName,
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const defaultValidation = {
    required: `${label} is required`,
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
    ...validation,
  };

  return (
    <div className={cn("mb-4", className)}>
      <Label className="mb-2" htmlFor={name}>
        {label}
        {defaultValidation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
            {React.cloneElement(startIcon, { className: cn("h-4 w-4", startIcon.props?.className) })}
          </div>
        )}
        <Input
          type={showPassword ? "text" : "password"}
          id={name}
          placeholder={placeholder}
          {...register(name, defaultValidation)}
          className={cn(startIcon && "pl-10", "pr-10", inputClassName)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}
