import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from "@/lib/utils";

export function DateField({
    label,
    name,
    register,
    errors,
    validation = {},
    startIcon,
    className,
    inputClassName, // Destructure this so it doesn't leak to DOM
    ...props
}) {
    return (
        <div className={cn("mb-4", className)}>
            <Label className="mb-2" htmlFor={name}>
                {label}
                {validation?.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="relative">
                {startIcon && (
                    <div className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">
                        {startIcon}
                    </div>
                )}
                <Input
                    type="date"
                    id={name}
                    {...register(name, validation)}
                    className={cn(startIcon && "pl-10", inputClassName)}
                    {...props}
                />
            </div>
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}
        </div>
    );
}
