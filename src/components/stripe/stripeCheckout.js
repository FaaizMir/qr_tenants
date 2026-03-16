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
      const errorMsg = err?.response?.data?.message || err?.message;
      const status = err?.response?.status;
      
      // Enhanced error handling for balance validation
      const handleValidationError = (message, statusCode) => {
        if (message) {
          // Check for specific balance validation errors
          const balanceErrorPatterns = {
            "insufficient agent wallet balance": "insufficientBalance",
            "admin not found": "noAdminId",
            "merchant not found": "validateBalance",
            "package not found": "validateBalance"
          };

          const lowerMessage = message.toLowerCase();
          for (const [pattern, key] of Object.entries(balanceErrorPatterns)) {
            if (lowerMessage.includes(pattern)) {
              if (key === "insufficientBalance") {
                // Extract amounts if available
                const data = err?.response?.data;
                if (data?.required && data?.available) {
                  return t(`errors.${key}`, { 
                    required: data.required, 
                    available: data.available 
                  });
                }
                return t(`errors.${key}`, { required: "N/A", available: "N/A" });
              }
              return t(`errors.${key}`);
            }
          }
        }

        // Handle by status code
        if (statusCode === 404) {
          return t("errors.validateBalance");
        }

        return message || t("errors.validateBalanceRetry");
      };

      const msg = handleValidationError(errorMsg, status);
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
      const errorMsg = err?.response?.data?.message || err?.message;
      const statusCode = err?.response?.status;
      
      // Enhanced error handling for Stripe checkout
      const handleStripeError = (message, status) => {
        if (message) {
          // Check for specific Stripe errors
          const stripeErrorPatterns = {
            "checkout session's total amount must convert to at least 50 cents": (message) => {
              // Extract currency amounts from the message
              const conversionMatch = message.match(/([₨$€£¥₹¢]+[\d,]+\.?\d*)\s+converts to approximately\s+([₨$€£¥₹¢]+[\d,]+\.?\d*)/i);
              if (conversionMatch) {
                const originalAmount = conversionMatch[1];
                const convertedAmount = conversionMatch[2];
                return t("errors.stripe.minimumAmountWithConversion", {
                  originalAmount,
                  convertedAmount
                });
              }
              return t("errors.stripe.minimumAmountError");
            },
            "amount must convert to at least 50 cents": "minimumAmountError",
            "currency conversion failed": "currencyConversionError", 
            "amount is too small": "amountTooSmall",
            "invalid currency": "invalidCurrency",
            "checkout session failed": "checkoutSessionFailed",
            "processing error": "processingError",
            "session expired": "sessionExpired",
            "rate limit exceeded": "rateLimitExceeded",
            "card not supported": "cardNotSupported",
            "authentication required": "authenticationRequired",
            "payment intent failed": "paymentIntentFailed"
          };

          const lowerMessage = message.toLowerCase();
          for (const [pattern, keyOrFunction] of Object.entries(stripeErrorPatterns)) {
            if (lowerMessage.includes(pattern)) {
              try {
                let translation;
                if (typeof keyOrFunction === 'function') {
                  translation = keyOrFunction(message);
                } else {
                  translation = t(`errors.stripe.${keyOrFunction}`);
                }
                if (translation) {
                  return translation;
                }
              } catch (e) {
                // Continue to other patterns
              }
            }
          }

          // Check for validation errors
          const validationErrorPatterns = {
            "invalid amount": "invalidAmount",
            "invalid currency": "invalidCurrency", 
            "invalid package": "invalidPackage"
          };

          for (const [pattern, key] of Object.entries(validationErrorPatterns)) {
            if (lowerMessage.includes(pattern)) {
              try {
                const translation = t(`errors.validation.${key}`);
                if (translation) {
                  return translation;
                }
              } catch (e) {
                // Continue to network errors
              }
            }
          }
        }

        // Handle network errors
        let networkErrorKey = null;
        switch (status) {
          case 400:
            networkErrorKey = "badRequest";
            break;
          case 401:
            networkErrorKey = "unauthorized";
            break;
          case 403:
            networkErrorKey = "forbidden";
            break;
          case 404:
            networkErrorKey = "notFound";
            break;
          case 500:
            networkErrorKey = "internalServerError";
            break;
          case 503:
            networkErrorKey = "serviceUnavailable";
            break;
          default:
            networkErrorKey = "serverError";
        }

        if (networkErrorKey) {
          try {
            const translation = t(`errors.network.${networkErrorKey}`);
            if (translation) {
              return translation;
            }
          } catch (e) {
            // Fall back to default
          }
        }

        return message || t("errors.startPayment");
      };

      setError(handleStripeError(errorMsg, statusCode));
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
