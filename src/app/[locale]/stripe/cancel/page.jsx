"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function StripeCancelPage() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params?.locale || "en";

  const isAgent = session?.user?.role === "agent" || session?.user?.role === "admin";
  const walletPath = isAgent ? `/${locale}/agent/wallet` : `/${locale}/merchant/wallet`;
  const backPath = isAgent ? `/${locale}/agent/dashboard` : `/${locale}/merchant/purchase`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Payment cancelled
      </h1>
      <p className="text-muted-foreground max-w-md">
        Your Stripe Checkout session was cancelled. No payment was taken.
      </p>
      <div className="flex gap-3">
        <Link href={backPath}>
          <Button>{isAgent ? "Back to dashboard" : "Back to purchase"}</Button>
        </Link>
        <Link href={walletPath}>
          <Button variant="outline">Go to wallet</Button>
        </Link>
      </div>
    </div>
  );
}


