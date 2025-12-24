"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StripeCancelPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Payment cancelled
      </h1>
      <p className="text-muted-foreground max-w-md">
        Your Stripe Checkout session was cancelled. No payment was taken.
      </p>
      <div className="flex gap-3">
        <Link href="/en/merchant/purchase">
          <Button>Back to purchase</Button>
        </Link>
        <Link href="/en/merchant/wallet">
          <Button variant="outline">Go to wallet</Button>
        </Link>
      </div>
    </div>
  );
}


