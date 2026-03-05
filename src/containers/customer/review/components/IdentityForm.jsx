"use client";

import React from "react";
import {
  User,
  ArrowRight,
  Calendar,
  Sparkles,
  CheckCircle2,
  Phone,
  MapPin,
  Mail,
  Users,
} from "lucide-react";
import { useWatch, Controller } from "react-hook-form";
import { PhoneInput } from "@/components/form-fields/phone-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  t,
}) => {
  const phone = useWatch({ control, name: "phone" });
  const debouncedPhone = useDebounce(phone, 800);
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);
  const lastFoundPhone = React.useRef("");

  const lookupCustomerByPhone = React.useCallback(
    async (phoneToQuery) => {
      if (!phoneToQuery || phoneToQuery.length < 8) return;
      if (lastFoundPhone.current === phoneToQuery) return;
      if (!merchantConfig?.id) return;

      try {
        const res = await axiosInstance.get(
          `/customers/check-by-phone?phone=${encodeURIComponent(phoneToQuery)}&merchant_id=${merchantConfig.id}`,
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
        if (data.gender) setValue("gender", data.gender);
        if (data.address) setValue("address", data.address);

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
        toast.success(t("identityForm.autoFillSuccess"));
      } catch (err) {
        // 404 or not found is NORMAL - don't show error toast
        setIsAutoFilled(false);

        // Only log errors that aren't 404
        if (err.response?.status !== 404) {
          const responseData = err.response?.data;
          const errorMsg = responseData?.message || responseData?.error;
          if (errorMsg) toast.error(errorMsg);
        }
      }
    },
    [merchantConfig, setValue],
  );

  React.useEffect(() => {
    if (debouncedPhone && debouncedPhone.length >= 8) {
      lookupCustomerByPhone(debouncedPhone);
    }
  }, [debouncedPhone, lookupCustomerByPhone]);

  const onSubmit = (data) => {
    nextStep();
  };

  return (
    <div className=" w-full flex items-center justify-center p-4 md:p-6 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-0 items-center">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16 bg-linear-to-br from-primary via-primary/95 to-primary/80  h-full relative overflow-hidden">
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
                {t("identityForm.welcome")}
                <br />
                <span className="text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-primary-100 to-white animate-shimmer bg-size-[200%_100%]">
                  {merchantConfig?.name || t("common.welcome")}
                </span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-white/80">
                <MapPin className="w-5 h-5" />
                <p className="text-base font-medium">
                  {merchantConfig?.address || t("identityForm.storeLocation")}
                </p>
              </div>

              <p className="text-base text-white/90 font-medium max-w-sm leading-relaxed mx-auto pt-2">
                {t("identityForm.joinMembers")}
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">5000+</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    {t("identityForm.members")}
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">4.9★</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    {t("identityForm.rating")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="bg-white/95 backdrop-blur-3xl  p-8 md:p-12 lg:p-14 border border-slate-200/50 h-full flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">
              {merchantConfig?.name || t("common.welcome")}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {merchantConfig?.address || t("identityForm.storeLocation")}
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="space-y-5 w-full text-left">
              <PhoneInput
                name="phone"
                control={control}
                label={
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t("identityForm.phoneNumber")}
                  </span>
                }
                required
                defaultCountry="US"
                placeholder={t("identityForm.phoneEnterPlaceholder")}
                className="mb-0"
                error={formErrors.phone?.message}
                validation={{
                  required: t("identityForm.phoneRequired"),
                }}
              />

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("identityForm.fullName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: t("identityForm.nameRequired") })}
                  placeholder={t("identityForm.nameEnterPlaceholder")}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <div className="flex items-center gap-2 mt-1">
                    <svg
                      className="w-4 h-4 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-red-600">
                      {formErrors.name.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("identityForm.email")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: t("identityForm.emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("identityForm.emailInvalid"),
                    },
                  })}
                  placeholder={t("identityForm.emailPlaceholder")}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <div className="flex items-center gap-2 mt-1">
                    <svg
                      className="w-4 h-4 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-red-600">
                      {formErrors.email.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("identityForm.address")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  {...register("address", {
                    required: t("identityForm.addressRequired"),
                  })}
                  placeholder={t("identityForm.addressPlaceholder")}
                  className={formErrors.address ? "border-red-500" : ""}
                />
                {formErrors.address && (
                  <div className="flex items-center gap-2 mt-1">
                    <svg
                      className="w-4 h-4 text-red-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-red-600">
                      {formErrors.address.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("identityForm.birthday")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register("dob", {
                      required: t("identityForm.dobRequired"),
                    })}
                    className={formErrors.dob ? "border-red-500" : ""}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {formErrors.dob && (
                    <div className="flex items-center gap-2 mt-1">
                      <svg
                        className="w-4 h-4 text-red-500 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-red-600">
                        {formErrors.dob.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 ">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("identityForm.gender")} <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: t("identityForm.genderRequired") }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={`w-full ${formErrors.gender ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder={t("identityForm.genderSelect")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("identityForm.genderMale")}</SelectItem>
                          <SelectItem value="female">{t("identityForm.genderFemale")}</SelectItem>
                          <SelectItem value="other">{t("identityForm.genderOther")}</SelectItem>
                          <SelectItem value="prefer_not_to_say">
                            {t("identityForm.genderPreferNotToSay")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formErrors.gender && (
                    <div className="flex items-center gap-2 mt-1">
                      <svg
                        className="w-4 h-4 text-red-500 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-red-600">
                        {formErrors.gender.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-10 rounded-md text-sm font-bold uppercase tracking-wide bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t("identityForm.continueToReview")}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {t("identityForm.securedBy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
