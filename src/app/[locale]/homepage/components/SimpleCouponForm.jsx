"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  AlertCircle,
  CheckCircle2,
  Gift,
  Loader2,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

export function SimpleCouponForm({ open, onOpenChange, merchant, batch }) {
  const t = useTranslations("Homepage");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthday: "",
  });
  const [errors, setErrors] = useState({});
  const [checkingPhone, setCheckingPhone] = useState(false);
  const debounceTimerRef = useRef(null);

  // Debounced phone number check
  const checkCustomerByPhone = useCallback(async (phone) => {
    if (!phone || phone.length < 8) return;

    setCheckingPhone(true);
    try {
      const res = await axiosInstance.get(
        `/feedbacks/check-customer-by-phone?phone=${encodeURIComponent(phone)}`,
      );

      if (res.data?.success && res.data?.data) {
        const customerData = res.data.data;
        // Auto-fill name and birthday if available
        setFormData((prev) => ({
          ...prev,
          name: customerData.name || prev.name,
          birthday: customerData.birthday
            ? new Date(customerData.birthday).toISOString().split("T")[0]
            : prev.birthday,
        }));
      }
    } catch (err) {
      // Silently fail - customer might not exist, which is okay
      console.log("Customer not found or error checking phone:", err);
    } finally {
      setCheckingPhone(false);
    }
  }, []);

  // Debounce phone input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (formData.phone) {
      debounceTimerRef.current = setTimeout(() => {
        checkCustomerByPhone(formData.phone);
      }, 500); // 500ms debounce
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData.phone, checkCustomerByPhone]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthday = "Birthday cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Issue coupon directly
      const response = await axiosInstance.post("/feedbacks", {
        merchant_id: merchant.id,
        batch_id: batch.id,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_birthday: formData.birthday,
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form after 2 seconds and close dialog
        setTimeout(() => {
          setFormData({ name: "", phone: "", birthday: "" });
          setSuccess(false);
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to issue coupon:", err);
      setError(
        err.response?.data?.message ||
          "Failed to issue coupon. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", phone: "", birthday: "" });
      setErrors({});
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-primary" />
            Get Your Coupon
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
                      {batch.discount_percentage}% OFF
                    </span>
                  )}
                </div>
              )}
              <div className="mt-1 text-sm text-slate-600">
                From {merchant?.name || "Merchant"}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Coupon Issued Successfully!
            </h3>
            <p className="text-slate-600">
              Your coupon has been sent to your phone via WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={loading}
                />
                {checkingPhone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
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
                Birthday <span className="text-red-500">*</span>
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
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Issuing..." : "Get Coupon"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
