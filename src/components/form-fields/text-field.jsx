import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TextField({
                            label, name, placeholder, register, errors, validation = {}, ...props
                          }) {
  // Check if field is required
  const isRequired = validation?.required;

  return (<div className='mb-4'>
    <Label className="mb-2" htmlFor={name}>
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      type="text"
      id={name}
      placeholder={placeholder}
      {...register(name, validation)}
      {...props}
    />
    {errors[name] && (<p className="text-red-500 text-sm mt-1">{errors[name].message}</p>)}
  </div>);
}
