"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";

import { useRouter, useParams } from "next/navigation";

export default function StripeSuccessPage() {
  const { data: session, update } = useSession();
  const [processing, setProcessing] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const refreshSubscription = async () => {
    try {
      // 1. Fetch latest merchant wallet/profile data
      const res = await axiosInstance.get(`/auth/profile`); // Or wallet endpoint
      const newData = res.data;

      // 2. Update session with new data
      // Note: we need to map the API response to the session structure expected by route.js
      await update({
        subscriptionType: newData.merchant?.merchant_type || "annual",
        is_subscription_expired: false,
        subscription_expires_at: newData.merchant?.subscription_expires_at // or calculated date
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // Fallback: force reload
      window.location.href = `/${locale}/merchant/wallet`;
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      const pkg = JSON.parse(localStorage.getItem("stripe_package"));
      const role = session?.user?.role;
      const adminId = session?.user?.adminId;
      const merchantId = session?.user?.merchantId;

      if (!pkg) {
        setProcessing(false);
        return;
      }

      try {
        if (pkg.id === "subscription-renewal") {
          // Agent Subscription Renewal
          if (adminId) {
            console.log("Renewing subscription for admin", adminId);
            await axiosInstance.post(`/wallets/admin/${adminId}/subscribe`);
            await refreshSubscription();
            toast.success("Subscription renewed successfully!");
          }
        } else if (merchantId) {
          if (pkg.id === "merchant-annual-upgrade") {
            // Merchant Annual Subscription Upgrade
            if (pkg.admin_id) {
              await axiosInstance.post(
                `/wallets/merchant/${merchantId}/upgrade-to-annual`,
                { admin_id: pkg.admin_id }
              );
              toast.success("Upgraded to Annual Subscription successfully!");
              await refreshSubscription();
            } else {
              console.error("Missing admin_id for upgrade");
              toast.error("Upgrade failed: Missing admin information.");
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
            toast.success("Credits added successfully!");
          }
        }

        localStorage.removeItem("stripe_package");
      } catch (err) {
        console.error("Failed to process payment completion:", err);
        toast.error(
          "Payment successful, but failed to update your account. Please contact support.",
        );
      } finally {
        setProcessing(false);
      }
    };

    if (session) {
      processPayment();
    } else {
      // If no session but we have local storage, maybe wait a bit?
      // For now, if no session we can't do much.
      setProcessing(false);
    }
  }, [refreshSubscription, session]);

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
      <h1 className="text-3xl font-bold tracking-tight">Payment successful</h1>
      <p className="text-muted-foreground max-w-md">
        Your payment was completed successfully.{" "}
        {processing
          ? "Adding credits to your wallet..."
          : "Credits will be reflected in your wallet shortly."}
      </p>
      <div className="flex gap-3">
        <Button
          disabled={processing}
          onClick={async () => {
            await refreshSubscription();
            router.push(walletPath);
          }}
        >
          Go to wallet
        </Button>
        <Button
          variant="outline"
          disabled={processing}
          onClick={async () => {
            await refreshSubscription();
            router.push(backPath);
          }}
        >
          {isAgentPayment ? "Back to dashboard" : "Back to purchase"}
        </Button>
      </div>
    </div>
  );
}
