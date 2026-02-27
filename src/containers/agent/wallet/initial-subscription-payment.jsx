"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  DollarSign,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Info,
  Plus,
} from "lucide-react";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InitialSubscriptionPayment({ adminId, onClose, onSuccess }) {
  const t = useTranslations("agentWallet.initialSubscription");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscriptionFee, setSubscriptionFee] = useState(0);
  const [currency, setCurrency] = useState("MYR");
  const [customBalance, setCustomBalance] = useState("");

  useEffect(() => {
    fetchSubscriptionFee();
  }, []);

  const fetchSubscriptionFee = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/super-admin-settings/admin-subscription-fee");
      const data = response.data?.data || response.data;
      setSubscriptionFee(Number(data.fee || 0));
      setCurrency(data.currency || "MYR");
    } catch (error) {
      console.error("Failed to fetch subscription fee:", error);
      toast.error(t("validation.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const balanceAmount = Number(customBalance) || 0;

    if (balanceAmount < 0) {
      toast.error(t("validation.negativeAmount"));
      return;
    }

    if (balanceAmount > 0 && balanceAmount < 100) {
      toast.error(t("validation.minimumAmount"));
      return;
    }

    setProcessing(true);

    try {
      const totalAmount = subscriptionFee + balanceAmount;
      const amountCents = Math.round(totalAmount * 100);

      // Create Stripe checkout session for subscription + balance
      const { data } = await axiosInstance.post("/stripe/create-checkout-session", {
        amount: amountCents,
        currency: currency.toLowerCase(),
        package_id: "agent_subscription_initial",
      });

      const sessionUrl = data?.sessionUrl;

      if (!sessionUrl) {
        toast.error(t("validation.paymentError"));
        setProcessing(false);
        return;
      }

      // Store payment info for success callback
      localStorage.setItem(
        "stripe_package",
        JSON.stringify({
          id: "agent_subscription_initial",
          name: "Agent Annual Subscription + Wallet Balance",
          price: totalAmount,
          currency: currency,
          type: "agent_initial_subscription",
          subscription_fee: subscriptionFee,
          wallet_balance: balanceAmount,
          credits: `Subscription + ${currency} ${balanceAmount.toLocaleString()} balance`,
        })
      );

      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error(
        error?.response?.data?.message || t("validation.createError")
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  const totalAmount = subscriptionFee + (Number(customBalance) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Alert */}
      <Alert className="border-primary/50 bg-primary/5">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>{t("alert.title")}</strong> {t("alert.description")}
        </AlertDescription>
      </Alert>

      {/* Subscription Fee Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{t("subscriptionFee.title")}</CardTitle>
              <CardDescription className="text-xs">{t("subscriptionFee.subtitle")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-600 mb-1">{t("subscriptionFee.access")}</p>
                <p className="text-sm text-slate-500">
                  {t("subscriptionFee.description")}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">{t("subscriptionFee.required")}</Badge>
                <p className="text-2xl font-black text-slate-900">
                  {currency} {subscriptionFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{t("walletBalance.title")}</CardTitle>
              <CardDescription className="text-xs">
                {t("walletBalance.subtitle")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customBalance">
              {t("walletBalance.label")}
              <Badge variant="outline" className="ml-2">{t("walletBalance.optional")}</Badge>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {currency}
              </span>
              <Input
                id="customBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder={t("walletBalance.placeholder")}
                value={customBalance}
                onChange={(e) => setCustomBalance(e.target.value)}
                className="pl-14 text-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              {t("walletBalance.hint", { currency })}
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>{t("walletBalance.modelInfo.title")}</strong> {t("walletBalance.modelInfo.description")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="border-2 border-primary/30 bg-linear-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-full text-white">
              <DollarSign className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">{t("summary.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t("summary.subscriptionFee")}</span>
              <span className="font-semibold">
                {currency} {subscriptionFee.toLocaleString()}
              </span>
            </div>
            {Number(customBalance) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t("summary.walletBalance")}</span>
                <span className="font-semibold">
                  +{currency} {Number(customBalance).toLocaleString()}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">{t("summary.totalPayment")}</span>
              <span className="text-2xl font-black text-primary">
                {currency} {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("summary.processing")}
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                {t("summary.payButton", { currency, amount: totalAmount.toLocaleString() })}
              </>
            )}
          </Button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100/50">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider leading-tight">
                {t("summary.securePayment.title")}
              </p>
              <p className="text-[10px] font-medium text-emerald-600/70 leading-tight">
                {t("summary.securePayment.description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm">{t("features.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              t("features.unlimitedMerchants"),
              t("features.whatsappIntegration"),
              t("features.qrGeneration"),
              t("features.couponManagement"),
              t("features.reviewCollection"),
              t("features.analytics"),
              t("features.chatSupport"),
              t("features.platformAccess"),
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
