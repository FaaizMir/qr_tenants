"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";

import { useRouter, useParams } from "next/navigation";

export default function StripeSuccessPage() {
  const t = useTranslations("merchantPurchase.stripeSuccess");
  const { data: session, update } = useSession();
  const [processing, setProcessing] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const hasProcessed = useRef(false); // Flag to prevent duplicate processing

  const refreshSubscription = async () => {
    try {
      // 1. Fetch latest merchant wallet/profile data
      const res = await axiosInstance.get(`/auth/profile`); // Or wallet endpoint
      const newData = res.data;
      console.log("newData", newData);
      // 2. Update session with new data
      // Note: we need to map the API response to the session structure expected by route.js
      const updatedData = await update({
        subscriptionType: newData.merchant?.merchant_type || "annual",
        is_subscription_expired: false,
        subscription_expires_at: newData.merchant?.subscription_expires_at // or calculated date
      });
      console.log("updatedData", updatedData);

      router.refresh();
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // Fallback: force reload
      window.location.href = `/${locale}/merchant/wallet`;
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      // Prevent duplicate processing
      if (hasProcessed.current) {
        return;
      }

      const pkg = JSON.parse(localStorage.getItem("stripe_package"));
      const role = session?.user?.role;
      const adminId = session?.user?.adminId;
      const merchantId = session?.user?.merchantId;

      if (!pkg) {
        setProcessing(false);
        return;
      }

      // Mark as processing to prevent duplicate calls
      hasProcessed.current = true;

      try {
        if (pkg.id === "subscription-renewal") {
          // Agent Subscription Renewal
          if (adminId) {
            console.log("Renewing subscription for admin", adminId);
            await axiosInstance.post(`/wallets/admin/${adminId}/subscribe`);
            await refreshSubscription();
            toast.success(t("toasts.subscriptionRenewed"));
          }
        } else if (pkg.id === "agent_subscription_initial") {
          // Agent Initial Subscription + Wallet Balance
          if (adminId) {
            console.log("Processing initial subscription for admin", adminId, "with balance", pkg.wallet_balance);
            await axiosInstance.post(`/wallets/admin/${adminId}/subscribe-with-balance`, {
              walletBalance: Number(pkg.wallet_balance) || 0,
              metadata: {
                subscription_fee: pkg.subscription_fee,
                wallet_balance: pkg.wallet_balance,
                total_paid: pkg.price,
              },
            });
            await refreshSubscription();
            const balanceMsg = pkg.wallet_balance > 0 
              ? ` ${t("toasts.walletBalance", { currency: pkg.currency, balance: pkg.wallet_balance })}`
              : "";
            toast.success(t("toasts.subscriptionActivated") + balanceMsg);
          }
        } else if (pkg.id === "custom_wallet_topup") {
          // Custom Wallet Top-Up (for agents with active subscription)
          if (adminId) {
            console.log("Processing custom wallet top-up for admin", adminId, "amount", pkg.wallet_balance);
            await axiosInstance.post(`/wallets/admin/${adminId}/topup`, {
              amount: Number(pkg.wallet_balance) || 0,
              description: `Custom wallet top-up`,
              metadata: {
                top_up_amount: pkg.wallet_balance,
                payment_date: new Date().toISOString(),
              },
            });
            toast.success(t("toasts.walletToppedUp", { 
              currency: pkg.currency, 
              amount: Number(pkg.wallet_balance).toLocaleString() 
            }));
          }
        } else if (merchantId) {
          if (pkg.id === "merchant-annual-upgrade") {
            // Merchant Annual Subscription Upgrade
            if (pkg.admin_id) {
              await axiosInstance.post(
                `/wallets/merchant/${merchantId}/upgrade-to-annual`,
                { admin_id: pkg.admin_id }
              );
              toast.success(t("toasts.upgradedToAnnual"));
              await refreshSubscription();
            } else {
              console.error("Missing admin_id for upgrade");
              toast.error(t("toasts.upgradeFailed"));
            }
          } else {
            // Standard Merchant Credit Purchase
            const payload = {
              credits: Number(pkg.credits) || 0,
              credit_type: pkg.credit_type || "general",
              amount: Number(pkg.price) || 0,
              admin_id: session?.user?.adminId,
              description: `${pkg.name} purchase`,
              package_id: pkg.id,
            };

            await axiosInstance.post(
              `/wallets/merchant/${merchantId}/add-credits`,
              payload,
            );
            toast.success(t("toasts.creditsAdded"));
          }
        }

        localStorage.removeItem("stripe_package");
      } catch (err) {
        console.error("Failed to process payment completion:", err);
        toast.error(t("toasts.processingFailed"));
        // Reset flag on error so user can retry if needed
        hasProcessed.current = false;
      } finally {
        setProcessing(false);
      }
    };

    if (session && !hasProcessed.current) {
      processPayment();
    } else if (!session) {
      // If no session but we have local storage, maybe wait a bit?
      // For now, if no session we can't do much.
      setProcessing(false);
    }
  }, [session]); // Removed refreshSubscription from dependencies

  const isAgentPayment =
    session?.user?.role === "agent" || session?.user?.role === "admin";
  const walletPath = isAgentPayment
    ? `/${locale}/agent/wallet`
    : `/${locale}/merchant/wallet`;
  const backPath = isAgentPayment
    ? `/${locale}/agent/dashboard`
    : `/${locale}/merchant/purchase`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground max-w-md">
        {t("description")}{" "}
        {processing
          ? t("processing")
          : t("reflected")}
      </p>
      <div className="flex gap-3">
        <Button
          disabled={processing}
          onClick={async () => {
            await refreshSubscription();
            router.push(walletPath);
          }}
        >
          {t("goToWallet")}
        </Button>
        <Button
          variant="outline"
          disabled={processing}
          onClick={async () => {
            await refreshSubscription();
            router.push(backPath);
          }}
        >
          {isAgentPayment ? t("backToDashboard") : t("backToPurchase")}
        </Button>
      </div>
    </div>
  );
}
