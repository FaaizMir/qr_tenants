import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxField({ label, checked, onChecked, error, ...props }) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={label}
          checked={checked}
          onCheckedChange={onChecked}
          {...props}
        />

        <Label htmlFor={label}>{label}</Label>
      </div>
    </div>
  );
}
