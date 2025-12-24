"use client";

import {
  CreditCard,
  Clock3,
  Check,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Coins,
  Receipt,
  Activity,
  AlertTriangle,
  ShieldOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletWarnings from "./wallet-warnings";
import { Badge } from "@/components/ui/badge";

const format = (num) => (typeof num === "number" ? num.toLocaleString() : "--");

export default function TemporaryWalletView({
  wallet,
  summary,
  onValidate,
  validating,
  embedded = false,
}) {
  const balance = wallet?.balance ?? 0;
  // Fallback to "Temporay" if tiers not present, though index assigns [MARKETING, UTILITY] to all currently
  // We'll stick to displaying "TEMPORARY" for strict logic or whatever tiers are passed
  const tiers = wallet?.tiers?.length ? wallet.tiers : ["TEMPORARY"];
  const batchUsage = summary?.batches || [];
  const creditDetails = wallet?.creditBreakdown || {};
  const status = wallet?.status || {};
  const expiresAt = wallet?.expiresAt || summary?.expiresAt;

  const isLow = balance < 100;

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h1 className="text-3xl font-bold">Wallet & Credits</h1>
          <p className="text-muted-foreground">
            Temporary merchants see temporary tier only. No transactions view.
          </p>
        </header>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Main Balance */}
        <Card className="bg-linear-to-br from-amber-50 via-background to-background border-amber-200/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-amber-500/10 blur-3xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Available Balance
              </CardTitle>
              <CardDescription>Temporary credits</CardDescription>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-amber-900">
              {format(balance)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <Badge
                  key={tier}
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                >
                  {tier}
                </Badge>
              ))}
            </div>
            <Button
              className="mt-6 w-full"
              variant="outline"
              size="sm"
              disabled={validating || balance <= 0}
              onClick={onValidate}
            >
              {validating ? "Validating..." : "Validate Balance"}
            </Button>
            {balance <= 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                <ShieldOff className="h-3.5 w-3.5" />
                Credits exhausted
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Credit Details */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Credit Breakdown
              </CardTitle>
              <CardDescription>Usage overview</CardDescription>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Purchased Total
              </span>
              <span className="font-semibold">
                {format(creditDetails.purchased)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Used Total
              </span>
              <span className="font-semibold">
                {format(creditDetails.used)}
              </span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">
                  Marketing Credits
                </span>
                <span className="font-medium">
                  {format(creditDetails.marketing)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">
                  Message Credits
                </span>
                <span className="font-medium">
                  {format(creditDetails.message)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">
                  Utility Credits
                </span>
                <span className="font-medium">
                  {format(creditDetails.utility)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Subscription & Status */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Subscription
              </CardTitle>
              <CardDescription>
                {status.currency || "USD"} Plan Status
              </CardDescription>
            </div>
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2">
              <span className="text-sm font-medium">Account Status</span>
              {status.isActive ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100/50 px-2 py-1 rounded-full border border-red-200">
                  <XCircle className="h-3.5 w-3.5" />
                  Inactive
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Type</span>
                <div className="font-semibold capitalize">
                  {wallet?.subscriptionType || "Temporary"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Currency</span>
                <div className="font-semibold">{status.currency || "USD"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Expires</span>
                <div
                  className={`font-medium text-sm ${
                    expiresAt ? "text-orange-600" : ""
                  }`}
                >
                  {expiresAt
                    ? new Date(expiresAt).toLocaleDateString()
                    : "No expiry"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Fee Paid</span>
                <div className="font-medium text-sm">
                  {status.annualFeePaid ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      N/A
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <WalletWarnings
        isLowBalance={isLow}
        expiresAt={expiresAt}
        merchantType="TEMPORARY"
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Batch-wise usage</h2>
            <p className="text-sm text-muted-foreground">
              Credits consumed per batch.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {batchUsage.length ? (
            batchUsage.map((batch) => (
              <Card key={batch.id || batch.name}>
                <CardContent className="pt-4 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{batch.name}</span>
                    <span className="text-muted-foreground">
                      {batch.tier || "Standard"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used: {format(batch.used)} / {format(batch.total || 0)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Last activity: {batch.lastUsed || "N/A"}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-4 text-sm text-muted-foreground">
                No batch usage available yet.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Transaction history and Marketing/Utility tiers are unavailable for
            temporary merchants.
          </span>
        </div>
      </section>
    </div>
  );
}
