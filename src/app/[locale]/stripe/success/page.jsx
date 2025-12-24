"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function StripeSuccessPage() {
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const addCredits = async () => {
      const pkg = JSON.parse(localStorage.getItem('stripe_package'));
      const merchantId = session?.user?.merchantId;

      if (!pkg || !merchantId) {
        setProcessing(false);
        return;
      }

      try {
        const payload = {
          credits: Number(pkg.credits) || 0,
          credit_type: pkg.credit_type || "general",
          amount: Number(pkg.price) || 0,
          admin_id: 1,
          description: `${pkg.name} purchase`,
          metadata: {
            package_id: pkg.id,
            package_name: pkg.name,
            package: pkg,
          },
        };

        await axiosInstance.post(`/wallets/merchant/${merchantId}/add-credits`, payload);
        toast.success("Credits added successfully!");
        localStorage.removeItem('stripe_package');
      } catch (err) {
        console.error("Failed to add credits:", err);
        toast.error("Payment successful, but failed to add credits. Please contact support.");
      } finally {
        setProcessing(false);
      }
    };

    if (session) {
      addCredits();
    } else {
      setProcessing(false);
    }
  }, [session]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Payment successful
      </h1>
      <p className="text-muted-foreground max-w-md">
        Your payment was completed successfully. {processing ? "Adding credits to your wallet..." : "Credits will be reflected in your wallet shortly."}
      </p>
      <div className="flex gap-3">
        <Link href="/en/merchant/wallet">
          <Button disabled={processing}>Go to wallet</Button>
        </Link>
        <Link href="/en/merchant/purchase">
          <Button variant="outline" disabled={processing}>Back to purchase</Button>
        </Link>
      </div>
    </div>
  );
}


