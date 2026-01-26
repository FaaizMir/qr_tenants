"use client";

import React from "react";
import {
    User,
    ArrowRight,
    Calendar,
    Mail,
    MapPin,
    Sparkles,
    Star,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import { useWatch, Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";

export const IdentityForm = ({
    register,
    handleSubmit,
    nextStep,
    setValue,
    control,
    errors: formErrors,
    merchantConfig,
}) => {
    const currentGender = useWatch({
        control,
        name: "gender",
    });

    const phone = useWatch({ control, name: "phone" });
    const debouncedPhone = useDebounce(phone, 500);
    const [isAutoFilled, setIsAutoFilled] = React.useState(false);
    const lastFoundPhone = React.useRef("");

    const lookupCustomerByPhone = async (phoneToQuery) => {
        if (!phoneToQuery || phoneToQuery.length < 8) return;
        if (lastFoundPhone.current === phoneToQuery) return;

        try {
            const res = await axiosInstance.get(
                `/feedbacks/check-customer-by-phone?phone=${encodeURIComponent(
                    phoneToQuery
                )}`
            );

            const data = res.data?.data;
            if (!data) {
                setIsAutoFilled(false);
                return;
            }

            lastFoundPhone.current = phoneToQuery;

            // Auto-fill fields
            if (data.name) setValue("name", data.name);
            if (data.email) setValue("email", data.email);
            if (data.address) setValue("address", data.address);
            if (data.gender) setValue("gender", data.gender.toLowerCase());
            if (data.date_of_birth) {
                // Handle various separators: / or - or .
                const dateStr = data.date_of_birth.split(/[T ]/)[0];
                const parts = dateStr.split(/[-/.]/);

                if (parts.length === 3) {
                    let year, month, day;

                    // Check if it's DD/MM/YYYY or DD-MM-YYYY
                    if (parts[2].length === 4) {
                        year = parts[2];
                        month = parts[1];
                        day = parts[0];
                    }
                    // Check if it's YYYY/MM/DD or YYYY-MM-DD
                    else if (parts[0].length === 4) {
                        year = parts[0];
                        month = parts[1];
                        day = parts[2];
                    }

                    if (year && month && day) {
                        // Ensure 2-digit month and day
                        const formattedMonth = month.padStart(2, '0');
                        const formattedDay = day.padStart(2, '0');
                        setValue("dob", `${year}-${formattedMonth}-${formattedDay}`);
                    }
                }
            }

            setIsAutoFilled(true);
            toast.success("We found your details and filled them for you 🎉");
        } catch (err) {
            // 404 or not found is NORMAL - don't show error toast
            setIsAutoFilled(false);
        }
    };

    React.useEffect(() => {
        if (debouncedPhone && debouncedPhone.length >= 10) {
            lookupCustomerByPhone(debouncedPhone);
        }
    }, [debouncedPhone]);

    const triggerError = (title, message) => {
        toast.error(`${title}: ${message}`);
    };

    const onSubmit = (data) => {
        if (!data.gender) {
            triggerError(
                "Selection Required",
                "Please select your gender to continue."
            );
            return;
        }
        nextStep();
    };

    const onError = (errors) => {
        const errorMessages = Object.values(errors).map((err) => err.message);
        if (errorMessages.length > 0) {
            triggerError("Form Incomplete", errorMessages[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700 ">
            <Card className="w-full border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white ">
                <CardHeader className="flex flex-col items-center text-center pb-8 border-b border-zinc-100/50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary mb-4 shadow-sm">
                        <User className="h-8 w-8" />
                    </div>
                    <div className="space-y-1.5">
                        <CardTitle className="text-3xl font-black tracking-tight">
                            {merchantConfig?.name && merchantConfig.name !== "Loading..."
                                ? merchantConfig.name
                                : "Welcome"}
                        </CardTitle>
                        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span>{merchantConfig?.address || "Store Location"}</span>
                        </div>
                        <CardDescription className="text-base font-medium pt-1">
                            Share your details to unlock exclusive rewards.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className={"px-20 py-8"}>
                    <form
                        onSubmit={handleSubmit(onSubmit, onError)}
                        className="space-y-8 w-full"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Phone Number <span className="text-primary">*</span>
                                </Label>
                                <div className="relative group min-h-12">
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{
                                            required: "Phone number is required",
                                            minLength: { value: 8, message: "Too short" },
                                            maxLength: { value: 15, message: "Too long" },
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <PhoneInput
                                                international
                                                defaultCountry="US"
                                                value={value}
                                                onChange={(val) => {
                                                    onChange(val);
                                                }}
                                                placeholder="Phone number"
                                                className="flex items-center gap-2 pl-3 px-3 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all text-sm font-medium [&_.PhoneInputCountry]:mr-0 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-auto"
                                                numberInputProps={{
                                                    className:
                                                        "bg-transparent border-none outline-none w-full h-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500",
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                {formErrors.phone && (
                                    <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                                        {formErrors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Full Name <span className="text-primary">*</span>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        disabled={isAutoFilled}
                                        placeholder="John Doe"
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                    />
                                </div>
                                {formErrors.name && (
                                    <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                                        {formErrors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Email Address <span className="text-primary">*</span>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        disabled={isAutoFilled}
                                        placeholder="john@example.com"
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                                        {formErrors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Date of Birth <span className="text-primary">*</span>
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="date"
                                        {...register("dob", {
                                            required: "Date of Birth is required",
                                        })}
                                        disabled={isAutoFilled}
                                        className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                    />
                                </div>
                                {formErrors.dob && (
                                    <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                                        {formErrors.dob.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                Residential Address <span className="text-primary">*</span>
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <Input
                                    {...register("address", { required: "Address is required" })}
                                    disabled={isAutoFilled}
                                    placeholder="Street, City, Zip"
                                    className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                />
                            </div>
                            {formErrors.address && (
                                <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                                    {formErrors.address.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-1 bg-primary rounded-full"></div>
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Select Gender <span className="text-primary">*</span>
                                </Label>
                            </div>
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                {["male", "female", "other"].map((g) => {
                                    const isActive = currentGender === g;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => {
                                                if (isAutoFilled) return;
                                                setValue("gender", g, { shouldValidate: true });
                                            }}
                                            className={cn(
                                                "group relative flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 font-bold capitalize text-sm gap-2 overflow-hidden",
                                                isActive
                                                    ? "border-primary bg-primary/5 text-primary shadow-[0_8px_16px_-6px_rgba(var(--primary),0.2)]"
                                                    : "border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 text-zinc-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary/70",
                                                isAutoFilled && "cursor-not-allowed opacity-80"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute top-1.5 right-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                            <span className="relative z-10">{g}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white group"
                            >
                                Continue to Review
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 py-4 flex justify-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        Verified Secure Experience{" "}
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Powered
                        by QR Tenants
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};
