import * as React from "react";
import { CheckIcon, ChevronsUpDown, Phone, Loader2 } from "lucide-react";
import PhoneInput, {
    parsePhoneNumber,
    isValidPhoneNumber,
    formatPhoneNumber,
    getCountryCallingCode,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { Controller } from "react-hook-form";

const DynamicPhoneInput = React.forwardRef(
    (
        {
            className,
            onChange,
            value,
            error,
            label,
            required,
            disabled,
            placeholder = "Enter phone number",
            defaultCountry = "PK",
            control,
            name,
            validation,
            isLoading = false,
            international = true,
            ...props
        },
        ref,
    ) => {
        // Inner component logic extracted for reuse
        const PhoneInputInner = ({
            value: innerValue,
            onChange: innerOnChange,
            error: innerError,
            ...innerProps
        }) => {
            const [isValid, setIsValid] = React.useState(true);
            const [formattedValue, setFormattedValue] = React.useState("");

            const handleValueChange = (newValue) => {
                setFormattedValue(newValue || "");
                const isValidPhone = newValue
                    ? isValidPhoneNumber(newValue)
                    : false;
                setIsValid(isValidPhone || !newValue);
                innerOnChange?.(newValue || "");
            };

            return (
                <div className={cn("mb-4", className)}>
                    {label && (
                        <Label
                            className={cn(
                                "text-sm font-medium mb-1",
                                innerError && "text-destructive",
                            )}
                        >
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                    )}

                    <div className="relative">
                        <PhoneInput
                            ref={ref}
                            className={cn(
                                "flex w-full",
                                innerError &&
                                "border-destructive focus-within:ring-destructive",
                                !isValid &&
                                innerValue &&
                                "border-orange-500 focus-within:ring-orange-500",
                            )}
                            flagComponent={FlagComponent}
                            countrySelectComponent={CountrySelect}
                            inputComponent={InputComponent}
                            smartCaret={true}
                            value={innerValue || undefined}
                            onChange={handleValueChange}
                            defaultCountry={defaultCountry}
                            flags={flags}
                            placeholder={placeholder}
                            disabled={disabled}
                            international={international}
                            withCountryCallingCode={true}
                            {...innerProps}
                        />
                        {isLoading ? (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Phone
                                className={cn(
                                    "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
                                    disabled && "opacity-50",
                                )}
                            />
                        )}
                    </div>

                    {innerError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            {innerError}
                        </p>
                    )}

                    {!isValid && innerValue && !innerError && (
                        <p className="text-sm text-orange-600 flex items-center gap-1">
                            Please enter a valid phone number
                        </p>
                    )}
                </div>
            );
        };

        // If control is provided, wrap in Controller
        if (control && name) {
            return (
                <Controller
                    control={control}
                    name={name}
                    rules={validation}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <PhoneInputInner
                            value={value}
                            onChange={onChange}
                            error={error?.message || props.error} // Prefer hook form error
                            {...props}
                        />
                    )}
                />
            );
        }

        // Direct usage without react-hook-form
        return (
            <PhoneInputInner
                value={value}
                onChange={onChange}
                error={error}
                {...props}
            />
        );
    },
);
DynamicPhoneInput.displayName = "DynamicPhoneInput";

// Enhanced Input Component with better styling
const InputComponent = React.forwardRef(({ className, ...props }, ref) => (
    <Input
        className={cn(
            "rounded-e-lg rounded-s-none border-l-0 pr-10",
            "focus:border-l focus:border-l-input",
            className,
        )}
        {...props}
        ref={ref}
    />
));
InputComponent.displayName = "InputComponent";

// Enhanced Country Select with search and favorites
// Popular countries that appear at the top
const POPULAR_COUNTRIES = ["PK", "US", "GB", "IN", "CA", "AU", "DE", "FR"];

// Enhanced Country Select with search and favorites
const CountrySelect = ({
    disabled,
    value: selectedCountry,
    options: countryList,
    onChange,
    flags: rpnFlags,
}) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    // Filter and sort countries
    const filteredCountries = React.useMemo(() => {
        const filtered = countryList.filter(
            (country) =>
                country.label?.toLowerCase().includes(searchValue.toLowerCase()) ||
                country.value?.toLowerCase().includes(searchValue.toLowerCase()),
        );

        if (!searchValue) {
            // Show popular countries first, then the rest
            const popular = filtered.filter((country) =>
                POPULAR_COUNTRIES.includes(country.value),
            );
            const others = filtered.filter(
                (country) => !POPULAR_COUNTRIES.includes(country.value),
            );

            return [
                ...popular.sort(
                    (a, b) =>
                        POPULAR_COUNTRIES.indexOf(a.value) -
                        POPULAR_COUNTRIES.indexOf(b.value),
                ),
                ...others.sort((a, b) => a.label.localeCompare(b.label)),
            ];
        }

        return filtered.sort((a, b) => a.label.localeCompare(b.label));
    }, [countryList, searchValue]);

    const selectedCountryInfo = countryList.find(
        (c) => c.value === selectedCountry,
    );

    return (
        <Popover
            open={isOpen}
            modal
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) setSearchValue("");
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "flex gap-2 rounded-e-none rounded-s-lg border-r-0 px-3 min-w-20",
                        "hover:bg-muted/50 focus:z-10 focus:ring-2 focus:ring-ring",
                        disabled && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={disabled}
                >
                    <FlagComponent
                        country={selectedCountry}
                        countryName={selectedCountryInfo?.label}
                        flags={rpnFlags}
                    />
                    {!disabled && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start" side="bottom">
                <Command>
                    <CommandInput
                        value={searchValue}
                        onValueChange={(value) => {
                            setSearchValue(value);
                            // Scroll to top when searching
                            setTimeout(() => {
                                const commandList = document.querySelector("[cmdk-list]");
                                if (commandList) {
                                    commandList.scrollTop = 0;
                                }
                            }, 0);
                        }}
                        placeholder="Search countries..."
                        className="border-0 focus:ring-0"
                    />
                    <CommandList className="max-h-72 overflow-y-auto">
                        <CommandEmpty>No country found.</CommandEmpty>

                        {!searchValue && (
                            <CommandGroup heading="Popular">
                                {filteredCountries
                                    .filter((country) =>
                                        POPULAR_COUNTRIES.includes(country.value),
                                    )
                                    .map(({ value, label }) =>
                                        value ? (
                                            <CountrySelectOption
                                                key={`popular-${value}`}
                                                country={value}
                                                countryName={label}
                                                flags={rpnFlags}
                                                selectedCountry={selectedCountry}
                                                onChange={onChange}
                                                onSelectComplete={() => setIsOpen(false)}
                                            />
                                        ) : null,
                                    )}
                            </CommandGroup>
                        )}

                        <CommandGroup heading={searchValue ? "Results" : "All Countries"}>
                            {filteredCountries
                                .filter(
                                    (country) =>
                                        searchValue || !POPULAR_COUNTRIES.includes(country.value),
                                )
                                .map(({ value, label }) =>
                                    value ? (
                                        <CountrySelectOption
                                            key={value}
                                            country={value}
                                            countryName={label}
                                            flags={rpnFlags}
                                            selectedCountry={selectedCountry}
                                            onChange={onChange}
                                            onSelectComplete={() => setIsOpen(false)}
                                        />
                                    ) : null,
                                )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// Enhanced Country Option with better styling
const CountrySelectOption = ({
    country,
    countryName,
    flags: rpnFlags,
    selectedCountry,
    onChange,
    onSelectComplete,
}) => {
    const isSelected = country === selectedCountry;
    const callingCode = getCountryCallingCode(country);

    const handleSelect = () => {
        onChange(country);
        onSelectComplete();
    };

    return (
        <CommandItem
            className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer",
                "hover:bg-muted/50 aria-selected:bg-muted",
                isSelected && "bg-muted",
            )}
            onSelect={handleSelect}
        >
            <FlagComponent
                country={country}
                countryName={countryName}
                flags={rpnFlags}
            />
            <span className="flex-1 text-sm font-medium truncate">{countryName}</span>
            <span className="text-xs text-muted-foreground font-mono">
                +{callingCode}
            </span>
            <CheckIcon
                className={cn(
                    "h-4 w-4 text-primary",
                    isSelected ? "opacity-100" : "opacity-0",
                )}
            />
        </CommandItem>
    );
};

// Enhanced Flag Component with fallback
const FlagComponent = ({ country, countryName, flags: rpnFlags }) => {
    const activeFlags = rpnFlags || flags;
    const CountryFlag = country ? activeFlags[country] : null;

    return (
        <span
            className={cn(
                "flex h-4 w-6 overflow-hidden rounded-sm bg-slate-100",
                "items-center justify-center shrink-0 border border-border/50",
            )}
        >
            {CountryFlag ? (
                <CountryFlag
                    title={countryName}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {country || "🌐"}
                </span>
            )}
        </span>
    );
};

// Hook for phone number validation and formatting
const usePhoneValidation = (value) => {
    return React.useMemo(() => {
        if (!value) return { isValid: true, formatted: "", country: null };

        try {
            const phoneNumber = parsePhoneNumber(value);
            return {
                isValid: isValidPhoneNumber(value),
                formatted: formatPhoneNumber(value),
                country: phoneNumber?.country,
                nationalNumber: phoneNumber?.nationalNumber,
                countryCallingCode: phoneNumber?.countryCallingCode,
            };
        } catch {
            return { isValid: false, formatted: value, country: null };
        }
    }, [value]);
};

export {
    DynamicPhoneInput as PhoneInput,
    DynamicPhoneInput as PhoneField,
    usePhoneValidation,
};
