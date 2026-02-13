"use client";

import { MerchantForm } from "./merchant-form";

export default function CreateMerchantContainer() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 lg:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Onboard New Merchant
        </h1>
        <p className="text-muted-foreground">
          Create a new merchant account, assign a subscription plan, and
          configure initial limits.
        </p>
      </div>

      <MerchantForm />
    </div>
  );
}
