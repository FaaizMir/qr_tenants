"use client";

import { CreditCard } from "lucide-react";
import { TransactionTable } from "@/components/common/transaction-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSubscriptionType } from "@/lib/auth-utils";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function MerchantWalletContainer({ embedded = false }) {
  const subscriptionType = getSubscriptionType();
  const credits = 2500;

  // Dummy transactions
  const transactions = [
    {
      id: 1,
      date: "2024-06-01",
      description: "Purchased 1000 Credits",
      amount: 1000,
      type: "credit",
      status: "paid",
    },
    {
      id: 2,
      date: "2024-05-28",
      description: "WhatsApp Campaign (50 msg)",
      amount: -50,
      type: "debit",
      status: "completed",
    },
    {
      id: 3,
      date: "2024-05-25",
      description: "Generated Batch 'Summer Special'",
      amount: -100,
      type: "debit",
      status: "completed",
    },
    {
      id: 4,
      date: "2024-05-20",
      description: "Purchased 500 Credits",
      amount: 500,
      type: "credit",
      status: "paid",
    },
  ];

  const creditPackages = [
    { credits: 500, price: "$10", popular: false },
    { credits: 1500, price: "$25", popular: true },
    { credits: 5000, price: "$75", popular: false },
  ];

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold">Wallet & Credits</h1>
          <p className="text-muted-foreground">
            Manage your credits and view transaction history
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card */}
        <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Available credits for campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <span className="text-4xl font-bold">
                {credits.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              1 Credit = 1 WhatsApp Message (approx)
            </p>
            <Button className="w-full">Auto-Recharge Settings</Button>
          </CardContent>
        </Card>

        {/* Buy Credits */}
        <div className="md:col-span-2 grid gap-4 grid-cols-1 sm:grid-cols-3">
          {creditPackages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${
                pkg.popular ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{pkg.credits} Credits</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-1">
                <p className="text-3xl font-bold mb-2">{pkg.price}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Instant delivery</p>
                  <p>Never expires</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
