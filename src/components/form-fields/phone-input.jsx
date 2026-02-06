"use client";

import * as React from "react";
import Image from "next/image";
import PhoneInputLib, {
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

import { Controller } from "react-hook-form";

/* ---------------------------------------------
   Popular Countries
--------------------------------------------- */
const POPULAR_COUNTRIES = ["PK", "US", "GB", "IN", "CA", "AU"];

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */
export function PhoneInput({
  value,
  onChange,
  control,
  name,
  validation,
  defaultCountry = "PK",
  label,
  error,
  disabled,
  placeholder = "Enter phone number",
}) {
  const [isValid, setIsValid] = React.useState(true);

  const handleChange = (val, fieldChange) => {
    if (val) {
      setIsValid(isValidPhoneNumber(val));
    } else {
      setIsValid(true);
    }
    fieldChange ? fieldChange(val || "") : onChange?.(val || "");
  };

  const internalInput = (val, onValueChange, fieldError) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <PhoneInputLib
        value={val || undefined}
        onChange={(v) => handleChange(v, onValueChange)}
        defaultCountry={defaultCountry}
        international
        withCountryCallingCode
        disabled={disabled}
        placeholder={placeholder}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
      />

      {(error || fieldError) && (
        <p className="text-sm text-red-500">{error || fieldError?.message}</p>
      )}

      {!error && !fieldError && !isValid && val && (
        <p className="text-sm text-orange-500">Invalid phone number</p>
      )}
    </div>
  );

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field, fieldState: { error: fieldError } }) =>
          internalInput(field.value, field.onChange, fieldError)
        }
      />
    );
  }

  return internalInput(value, onChange);
}

/* ---------------------------------------------
   INPUT COMPONENT
--------------------------------------------- */
const InputComponent = React.forwardRef(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn("rounded-l-none border-l-0 pr-10", className)}
    {...props}
  />
));
InputComponent.displayName = "InputComponent";

/* ---------------------------------------------
   COUNTRY SELECT
--------------------------------------------- */
function CountrySelect({ value, onChange, options, disabled }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const searchLower = search.toLowerCase().trim();

  const filtered = options.filter((c) => {
    if (!c.value) return false;
    if (!searchLower) return true;

    const countryName = c.label.toLowerCase();
    const countryCode = c.value.toLowerCase();
    let callingCode = "";
    try {
      callingCode = getCountryCallingCode(c.value);
    } catch (e) {}

    return (
      countryName.includes(searchLower) ||
      countryCode.includes(searchLower) ||
      callingCode.includes(searchLower.replace("+", ""))
    );
  });

  const sorted = filtered.sort((a, b) => {
    if (searchLower) {
      const aStarts =
        a.label.toLowerCase().startsWith(searchLower) ||
        a.value.toLowerCase().startsWith(searchLower);
      const bStarts =
        b.label.toLowerCase().startsWith(searchLower) ||
        b.value.toLowerCase().startsWith(searchLower);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    return a.label.localeCompare(b.label);
  });

  const popular = sorted.filter((c) => POPULAR_COUNTRIES.includes(c.value));
  const remaining = sorted.filter((c) => !POPULAR_COUNTRIES.includes(c.value));

  const selected = options.find((c) => c.value === value);

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const renderItem = (c) => (
    <CommandItem
      key={c.value}
      onSelect={() => {
        onChange(c.value);
        setOpen(false);
      }}
    >
      {c.value && <Flag country={c.value} />}
      <span className="ml-2 flex-1">{c.label}</span>
      <span className="text-xs text-muted-foreground">
        {c.value && (
          <span className="text-xs text-muted-foreground">
            +{getCountryCallingCode(c.value)}
          </span>
        )}
      </span>
      {value === c.value && <Check className="ml-2 h-4 w-4 text-primary" />}
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="rounded-r-none border-r-0 gap-2 px-3"
        >
          <Flag country={value} />
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search country..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            className="max-h-64 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>No country found</CommandEmpty>

            {!searchLower && popular.length > 0 && (
              <CommandGroup heading="Popular">
                {popular.map(renderItem)}
              </CommandGroup>
            )}

            <CommandGroup heading="Countries">
              {searchLower ? sorted.map(renderItem) : remaining.map(renderItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------------------
   FLAG COMPONENT (PNG – Next.js Safe)
--------------------------------------------- */
function Flag({ country }) {
  if (!country) return null;

  return (
    <Image
      src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`}
      alt={country}
      width={24}
      height={16}
      className="h-4 w-6 rounded-sm object-cover"
      unoptimized
    />
  );
}
