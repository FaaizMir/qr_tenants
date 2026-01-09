"use client";

import React from "react";
import {
  User,
  ArrowRight,
  Calendar,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useWatch, Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

  const validateAge = (value) => {
    if (!value) return "Date of Birth is required";
    const today = new Date();
    const birthDate = new Date(value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 13) return "You must be at least 13 years old";
    if (age > 100) return "Please enter a valid date";
    return true;
  };

  const onSubmit = (data) => {
    if (!data.gender) {
      toast.error("Please select a gender");
      return;
    }
    nextStep();
  };

  const onError = (errors) => {
    const errorMessages = Object.values(errors).map((err) => err.message);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-2 md:p-4">
      <Card className="w-full border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden rounded-4xl">
        {/* Merchant Branding Banner */}
        <div className="relative h-32 md:h-44 overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),rgba(16,185,129,0))]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl scale-150"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl scale-150"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            {merchantConfig?.logo && (
              <div className="mb-3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 overflow-hidden shadow-2xl">
                <img
                  src={merchantConfig.logo}
                  alt="Merchant Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Exclusive Experience"}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {merchantConfig?.address || "Premium Location"}
            </div>
          </div>
        </div>

        <CardHeader className="text-center pb-8 pt-12 relative px-6 md:px-10">
          <div className="absolute top-4 left-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </div>

          <div className="mx-auto w-20 h-20 rounded-3xl bg-linear-to-br from-primary/5 to-primary/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
            <User className="w-10 h-10 text-primary" />
          </div>

          <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
            WELCOME!
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto mt-2 leading-tight">
            Help us personalize your experience to unlock exclusive rewards.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-12 px-6 md:px-10">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="e.g. John Doe"
                    className="pl-11 h-13 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                    {formErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
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
                    placeholder="john@example.com"
                    className="pl-11 h-13 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                    {formErrors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    type="date"
                    {...register("dob", {
                      required: "Date of Birth is required",
                      validate: validateAge,
                    })}
                    className="pl-11 h-13 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                  />
                </div>
                {formErrors.dob && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                    {formErrors.dob.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
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
                        onChange={onChange}
                        placeholder="+1 234 567 890"
                        className="flex items-center gap-3 pl-4 pr-4 h-13 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all text-sm font-medium [&_.PhoneInputCountry]:mr-0 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-auto [&_.PhoneInputCountrySelect]:cursor-pointer"
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
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-1">
                Residential Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  {...register("address", { required: "Address is required" })}
                  placeholder="Full address (Street, City, Zip)"
                  className="pl-11 h-13 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
              {formErrors.address && (
                <p className="text-[10px] text-red-500 font-bold pl-1 animate-in slide-in-from-left-2">
                  {formErrors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-4 w-1 bg-primary rounded-full"></div>
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Select Gender <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {["male", "female", "other"].map((g) => {
                  const isActive = currentGender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setValue("gender", g, { shouldValidate: true })
                      }
                      className={cn(
                        "group relative flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 font-bold capitalize text-sm gap-2 overflow-hidden",
                        isActive
                          ? "border-primary bg-primary/5 text-primary shadow-[0_8px_16px_-6px_rgba(var(--primary),0.2)]"
                          : "border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 text-zinc-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary/70"
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

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-15 rounded-2xl text-lg font-black uppercase tracking-widest shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-none group"
              >
                Continue
                <div className="ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer branding */}
        <div className="bg-zinc-50 dark:bg-zinc-800/20 py-5 text-center border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Powered by QR Tenants
            </p>
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
