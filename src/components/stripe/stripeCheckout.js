"use client";

import React, { useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const StripeCheckout = ({ pkg }) => {
  const t = useTranslations("merchantPurchase.stripeCheckout");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priceNumber = Number(pkg?.price) || 0;
  const currency = (pkg?.currency || "USD").toLowerCase();
  const amountCents = Math.round(priceNumber * 100);

  const formattedPrice = useMemo(() => {
    if (!amountCents || Number.isNaN(amountCents)) return "--";
    return `${currency.toUpperCase()} ${(amountCents / 100).toLocaleString()}`;
  }, [amountCents, currency]);

  const validateAgentBalance = async () => {
    try {
      const adminId = session?.user?.adminId; // Extract admin ID from session
      console.log("Validating agent balance for adminId:", adminId, "and packageId:", pkg?.id);
      if (!adminId) {
        throw new Error(t("errors.noAdminId"));
      }

      const { data } = await axiosInstance.get(
        `/wallets/validate-balance?package_id=${pkg?.id}&admin_id=${adminId}`
      );

      if (!data?.isValid) {
        throw new Error(
          t("errors.insufficientBalance", { 
            required: data?.required, 
            available: data?.available 
          })
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 404
          ? t("errors.validateBalance")
          : err?.response?.data?.message ||
            err?.message ||
            t("errors.validateBalanceRetry");
      setError(msg);
      throw err; // Prevent further execution
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate wallet balance before proceeding
      await validateAgentBalance();

      const { data } = await axiosInstance.post(
        "/stripe/create-checkout-session",
        {
          amount: amountCents,
          currency,
          package_id: pkg?.id,
        }
      );

      const sessionUrl = data?.sessionUrl;

      if (!sessionUrl) {
        setError(t("errors.startCheckout"));
        return;
      }

      // ✅ Correct replacement for redirectToCheckout
      // Store package info for success page
      localStorage.setItem('stripe_package', JSON.stringify(pkg));
      window.location.href = sessionUrl;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("errors.startPayment");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">{t("payableAmount")}</div>
        <div className="text-2xl font-semibold">{formattedPrice}</div>
        <div className="text-xs text-muted-foreground">
          {pkg?.name
            ? `${pkg.name} • ${pkg?.credits ?? ""} ${t("credits")}`
            : t("packagePurchase")}
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? t("redirecting") : t("payWithStripe")}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default StripeCheckout;
