"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Gift,
  Loader2,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { PhoneInput } from "@/components/form-fields/phone-input";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function CouponForm({ open, onOpenChange, merchant, batch }) {
  const t = useTranslations("Homepage.couponForm");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthday: "",
  });
  const [errors, setErrors] = useState({});
  const [checkingPhone, setCheckingPhone] = useState(false);
  const debounceTimerRef = useRef(null);

  const convertDateToInputFormat = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split(/[-/.]/);
    if (parts.length !== 3) return "";

    const [first, second, third] = parts;
    const year = third.length === 4 ? third : first;
    const month = third.length === 4 ? second : second;
    const day = third.length === 4 ? first : third;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const checkCustomerByPhone = useCallback(
    async (phone) => {
      if (!phone || phone.length < 8) return;
      if (!merchant?.id) return;

      setCheckingPhone(true);
      try {
        const res = await axiosInstance.get(
          `/customers/check-by-phone?phone=${encodeURIComponent(phone)}&merchant_id=${merchant.id}`,
        );

        const customerData = res.data?.data;
        if (customerData?.name) {
          setFormData((prev) => ({
            ...prev,
            phone,
            name: customerData.name || "",
            birthday:
              convertDateToInputFormat(customerData.date_of_birth) || "",
          }));
        }
      } catch (err) {
        console.log("Customer lookup failed:", err);
      } finally {
        setCheckingPhone(false);
      }
    },
    [merchant],
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (formData.phone) {
      debounceTimerRef.current = setTimeout(() => {
        checkCustomerByPhone(formData.phone);
      }, 800);
    }

    return () => clearTimeout(debounceTimerRef.current);
  }, [formData.phone, checkCustomerByPhone]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = t("nameRequired");
    if (!formData.phone.trim()) {
      newErrors.phone = t("phoneRequired");
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = t("phoneInvalid");
    }
    if (!formData.birthday) {
      newErrors.birthday = t("birthdayRequired");
    } else if (new Date(formData.birthday) > new Date()) {
      newErrors.birthday = t("birthdayFuture");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const [year, month, day] = formData.birthday.split("-");
      await axiosInstance.post("/customers/claim-coupon", {
        merchant_id: merchant.id,
        coupon_batch_id: batch.id,
        name: formData.name,
        phone: formData.phone,
        date_of_birth: `${day}-${month}-${year}`,
      });

      toast.success(t("successToast"));
      setSuccess(true);
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.errors
        ? Object.values(errorData.errors).flat().join(", ")
        : errorData?.message ||
          errorData?.error ||
          t("errorDefault");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", phone: "", birthday: "" });
      setErrors({});
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!success && (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Gift className="h-6 w-6 text-primary" />
              {t("title")}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {batch?.batch_name && (
                  <div className="mt-2">
                    <span className="font-semibold text-slate-900">
                      {batch.batch_name}
                    </span>
                    {batch?.discount_percentage && (
                      <span className="ml-2 text-primary font-bold">
                        {t("discount", { percentage: batch.discount_percentage })}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-1 text-sm text-slate-600">
                  {t("from", { merchantName: merchant?.name || "Merchant" })}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        )}

        {success ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t("successTitle")}
            </h3>
            <p className="text-slate-600 mb-6">
              {t("successMessage")}
            </p>
            <Button onClick={handleClose} className="w-full">
              {t("close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              label={
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("phoneNumber")}
                </span>
              }
              required
              defaultCountry="US"
              value={formData.phone || undefined}
              onChange={(value) => handleChange("phone", value || "")}
              disabled={loading}
              isLoading={checkingPhone}
              placeholder={t("phonePlaceholder")}
              className="mb-0"
              error={errors.phone}
            />

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("fullName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("birthday")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                className={errors.birthday ? "border-red-500" : ""}
                disabled={loading}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.birthday && (
                <p className="text-sm text-red-500">{errors.birthday}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t("issuing") : t("getCoupon")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
