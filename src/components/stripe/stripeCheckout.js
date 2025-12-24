"use client";

import React, { useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";

const StripeCheckout = ({ pkg }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priceNumber = Number(pkg?.price) || 0;
  const currency = (pkg?.currency || "USD").toLowerCase();
  const amountCents = Math.round(priceNumber * 100);

  const formattedPrice = useMemo(() => {
    if (!amountCents || Number.isNaN(amountCents)) return "--";
    return `${currency.toUpperCase()} ${(amountCents / 100).toLocaleString()}`;
  }, [amountCents, currency]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");

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
        setError("Unable to start Stripe Checkout. Please try again.");
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
        "Unable to start payment. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Payable amount</div>
        <div className="text-2xl font-semibold">{formattedPrice}</div>
        <div className="text-xs text-muted-foreground">
          {pkg?.name
            ? `${pkg.name} • ${pkg?.credits ?? ""} credits`
            : "Package purchase"}
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Redirecting to Stripe..." : "Pay with Stripe"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default StripeCheckout;
