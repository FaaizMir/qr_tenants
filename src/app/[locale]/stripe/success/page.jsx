"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";

import { useRouter, useParams } from "next/navigation";
import { useSubscription } from "@/context/SubscriptionContext";

export default function StripeSuccessPage() {
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(true);
  const { refreshSubscription } = useSubscription();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  useEffect(() => {
    const processPayment = async () => {
      const pkg = JSON.parse(localStorage.getItem('stripe_package'));
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
          // Standard Merchant Credit Purchase
          const payload = {
            credits: Number(pkg.credits) || 0,
            credit_type: pkg.credit_type || "general",
            amount: Number(pkg.price) || 0,
            admin_id: session?.user?.adminId,
            description: `${pkg.name} purchase`,
            metadata: {
              package_id: pkg.id,
              package_name: pkg.name,
              package: pkg,
            },
          };

          await axiosInstance.post(`/wallets/merchant/${merchantId}/add-credits`, payload);
          toast.success("Credits added successfully!");
        }

        localStorage.removeItem('stripe_package');
      } catch (err) {
        console.error("Failed to process payment completion:", err);
        toast.error("Payment successful, but failed to update your account. Please contact support.");
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
  }, [session]);

  const isAgentPayment = session?.user?.role === "agent" || session?.user?.role === "admin";
  const walletPath = isAgentPayment ? `/${locale}/agent/wallet` : `/${locale}/merchant/wallet`;
  const backPath = isAgentPayment ? `/${locale}/agent/dashboard` : `/${locale}/merchant/purchase`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Payment successful
      </h1>
      <p className="text-muted-foreground max-w-md">
        Your payment was completed successfully. {processing ? "Adding credits to your wallet..." : "Credits will be reflected in your wallet shortly."}
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


