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

  const lookupCustomerByPhone = React.useCallback(
    async (phoneToQuery) => {
      if (!phoneToQuery || phoneToQuery.length < 8) return;
      if (lastFoundPhone.current === phoneToQuery) return;

      try {
        const res = await axiosInstance.get(
          `/feedbacks/check-customer-by-phone?phone=${encodeURIComponent(
            phoneToQuery,
          )}`,
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
              const formattedMonth = month.padStart(2, "0");
              const formattedDay = day.padStart(2, "0");
              setValue("dob", `${year}-${formattedMonth}-${formattedDay}`);
            }
          }
        }

        setIsAutoFilled(true);
        toast.success("We found your details and filled them for you 🎉");
      } catch (err) {
        // 404 or not found is NORMAL - don't show error toast
        setIsAutoFilled(false);

        // Only log errors that aren't 404
        if (err.response?.status !== 404) {
          console.warn("Customer lookup error:", err.message);
          // Don't show toast - this is not critical, user can still fill manually
        }
      }
    },
    [setValue],
  );

  React.useEffect(() => {
    if (debouncedPhone && debouncedPhone.length >= 10) {
      lookupCustomerByPhone(debouncedPhone);
    }
  }, [debouncedPhone, lookupCustomerByPhone]);

  const triggerError = (title, message) => {
    toast.error(`${title}: ${message}`);
  };

  const onSubmit = (data) => {
    if (!data.gender) {
      triggerError(
        "Selection Required",
        "Please select your gender to continue.",
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
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-0 items-center">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16 bg-linear-to-br from-primary via-primary/95 to-primary/80 rounded-l-[2.5rem] h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
              <User className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Welcome to
                <br />
                <span className="text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-primary-100 to-white animate-shimmer bg-size-[200%_100%]">
                  {merchantConfig?.name || "Our Store"}
                </span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-white/80">
                <MapPin className="w-5 h-5" />
                <p className="text-base font-medium">
                  {merchantConfig?.address || "Store Location"}
                </p>
              </div>

              <p className="text-base text-white/90 font-medium max-w-sm leading-relaxed mx-auto pt-2">
                Join thousands of happy customers and unlock exclusive rewards
                designed just for you.
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">5000+</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    Members
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">4.9★</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="bg-white/80 backdrop-blur-2xl lg:rounded-r-[2.5rem] rounded-3xl lg:rounded-l-none p-8 md:p-12 border border-slate-200/50 shadow-2xl h-full flex flex-col justify-center overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">
              {merchantConfig?.name || "Welcome"}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {merchantConfig?.address || "Store Location"}
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6 w-full"
          >
            <div className="space-y-5">
              <div className="relative group">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
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
                        placeholder="+1 (555) 000-0000"
                        className="flex items-center gap-2 pl-4 px-4 h-12 rounded-xl bg-white border border-slate-200 focus-within:border-primary transition-all text-sm [&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-auto"
                        numberInputProps={{
                          className:
                            "bg-transparent border-none outline-none w-full h-full text-zinc-900 placeholder:text-zinc-400",
                        }}
                      />
                    )}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {formErrors.phone.message}
                  </p>
                )}
              </div>

              <div className="relative group">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...register("name", { required: "Name is required" })}
                    disabled={isAutoFilled}
                    placeholder="John Doe"
                    className="pl-12 pr-4 h-12 rounded-xl bg-white border border-slate-200 focus:border-primary transition-all text-sm disabled:opacity-60"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {formErrors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group">
                  <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
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
                      className="pl-12 pr-4 h-12 rounded-xl bg-white border border-slate-200 focus:border-primary transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500"></span>
                      {formErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative group">
                  <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Birthday <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="date"
                      {...register("dob", {
                        required: "Date of Birth is required",
                      })}
                      disabled={isAutoFilled}
                      className="pl-12 pr-4 h-12 rounded-xl bg-white border border-slate-200 focus:border-primary transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  {formErrors.dob && (
                    <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500"></span>
                      {formErrors.dob.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative group">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                  Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...register("address", {
                      required: "Address is required",
                    })}
                    disabled={isAutoFilled}
                    placeholder="Street, City, Zip Code"
                    className="pl-12 pr-4 h-12 rounded-xl bg-white border border-slate-200 focus:border-primary transition-all text-sm disabled:opacity-60"
                  />
                </div>
                {formErrors.address && (
                  <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {formErrors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-3 block">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3">
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
                          "flex-1 relative h-12 rounded-xl font-semibold capitalize text-sm transition-all",
                          isActive
                            ? "bg-primary text-white shadow-md"
                            : "bg-white border border-slate-200 text-zinc-600 hover:border-primary",
                          isAutoFilled && "cursor-not-allowed opacity-60",
                        )}
                      >
                        {isActive && (
                          <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                        )}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wide bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    Continue to Review
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Secured by QR Tenants • All data encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
