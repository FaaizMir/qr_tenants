"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletWarnings from "./wallet-warnings";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

const format = (num) => {
  const n = Number(num);
  return !isNaN(n) ? n.toLocaleString() : "--";
};

export default function TemporaryWalletView({
  wallet,
  summary,
  onValidate,
  validating,
  embedded = false,
}) {
  const t = useTranslations("merchantWallet");
  const balance = wallet?.balance ?? 0;
  // Fallback to "Temporay" if tiers not present, though index assigns [MARKETING, UTILITY] to all currently
  // We'll stick to displaying "TEMPORARY" for strict logic or whatever tiers are passed
  const tiers = wallet?.tiers?.length ? wallet.tiers : ["TEMPORARY"];
  const batchUsage = summary?.batches || [];
  const creditDetails = wallet?.creditBreakdown || {};
  const status = wallet?.status || {};
  const expiresAt = wallet?.expiresAt || summary?.expiresAt;

  const isLow = balance < 100;

  const [feeData, setFeeData] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        setLoadingFee(true);
        const res = await axiosInstance.get("/merchant-settings/subscription-fee");
        setFeeData(res.data?.data || res.data);
      } catch (error) {
        console.error("Failed to fetch subscription fee:", error);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchFee();
  }, []);
  console.log("feeData222", feeData)


  const handleUpgrade = async () => {
    if (!feeData || !wallet?.merchant?.admin_id) {
      toast.error(t("errors.missingFeeInfo"));
      return;
    }

    try {
      setUpgrading(true);
      const amount = Number(feeData.fee) * 100; // cents

      // Save package info for success page
      localStorage.setItem("stripe_package", JSON.stringify({
        id: "merchant-annual-upgrade",
        name: "Annual Merchant Subscription",
        price: feeData.fee,
        currency: feeData.currency,
        admin_id: wallet.merchant.admin_id
      }));

      // Create checkout session
      const res = await axiosInstance.post("/stripe/create-checkout-session", {
        amount: amount,
        currency: feeData.currency || "usd",
        package_id: 0, // Dummy ID as we handle logic via localStorage/metadata
      });

      if (res.data?.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      } else {
        throw new Error(t("errors.noSessionUrl"));
      }

    } catch (error) {
      console.error("Upgrade failed:", error);
      toast.error(t("errors.upgradeFailed"));
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h1 className="text-3xl font-bold">{t("header.title")}</h1>
          <p className="text-muted-foreground">
            {t("header.temporarySubtitle")}
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
                {t("availableBalance.totalRemaining")}
              </CardTitle>
              <CardDescription>{t("availableBalance.temporaryCredits")}</CardDescription>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {t("availableBalance.mainBalance")}
              </span>
              <div className="text-4xl font-bold tracking-tight text-amber-900">
                {format(balance)}
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                <span className="text-amber-800 text-xs font-medium">
                  {t("availableBalance.couponCredits")}
                </span>
                <span className="font-bold text-sm text-amber-900">
                  {format(creditDetails.marketing)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                <span className="text-amber-800 text-xs font-medium">
                  {t("availableBalance.whatsappUiCredits")}
                </span>
                <span className="font-bold text-sm text-amber-900">
                  {format(creditDetails.whatsapp_ui ?? creditDetails.message)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                <span className="text-amber-800 text-xs font-medium">
                  {t("availableBalance.paidAdCredits")}
                </span>
                <span className="font-bold text-sm text-amber-900">
                  {format(creditDetails.utility)}
                </span>
              </div>
            </div>

            {/* <Button
              className="mt-2 w-full"
              variant="outline"
              size="sm"
              disabled={validating || balance <= 0}
              onClick={onValidate}
            >
              {validating ? "Validating..." : "Validate Balance"}
            </Button> */}
            {balance <= 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                <ShieldOff className="h-3.5 w-3.5" />
                {t("availableBalance.creditsExhausted")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Credit Details */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                {t("creditBreakdown.title")}
              </CardTitle>
              <CardDescription>{t("creditBreakdown.usageOverview")}</CardDescription>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t("creditBreakdown.purchased")}
                </span>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {format(creditDetails.purchased)}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-rose-50/50 border border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10">
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  {t("creditBreakdown.used")}
                </span>
                <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                  {format(creditDetails.used)}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
                <span>{t("creditBreakdown.usageEfficiency")}</span>
                <span className="font-medium text-foreground">
                  {creditDetails.purchased > 0
                    ? Math.round(
                      (creditDetails.used / creditDetails.purchased) * 100,
                    )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Annual Subscription Upgrade */}
        <Card className="border-blue-200 bg-blue-50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-500/10 blur-3xl opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-blue-900">
                {t("upgrade.title")}
              </CardTitle>
              <CardDescription className="text-blue-700/80">
                {t("upgrade.subtitle")}
              </CardDescription>
            </div>
            <div className="rounded-full bg-blue-200 p-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-blue-900">
              {loadingFee ? (
                <span className="animate-pulse">{t("upgrade.loadingFee")}</span>
              ) : feeData ? (
                `${feeData.currency} ${format(feeData.fee)}`
              ) : (
                t("upgrade.unavailable")
              )}
              <span className="text-sm font-normal text-blue-700 ml-1">{t("upgrade.perYear")}</span>
            </div>
            <p className="text-sm text-blue-800/80">
              {t("upgrade.description")}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loadingFee || upgrading || !feeData}
              onClick={handleUpgrade}
            >
              {upgrading ? t("upgrade.processing") : t("upgrade.upgradeNow")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t("batchUsage.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("batchUsage.temporarySubtitle")}
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
                      {batch.tier || t("batchUsage.standard")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("batchUsage.used", { used: format(batch.used), total: format(batch.total || 0) })}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {t("batchUsage.lastUsed", { date: batch.lastUsed || t("batchUsage.notAvailable") })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-4 text-sm text-muted-foreground">
                {t("batchUsage.noData")}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {t("warnings.unavailableForTemporary")}
          </span>
        </div>
      </section>
    </div>
  );
}
