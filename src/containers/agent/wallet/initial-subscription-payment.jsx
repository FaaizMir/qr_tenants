"use client";

import { useState, useEffect } from "react";
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
      toast.error("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const balanceAmount = Number(customBalance) || 0;

    if (balanceAmount < 0) {
      toast.error("Balance amount cannot be negative");
      return;
    }

    if (balanceAmount > 0 && balanceAmount < 100) {
      toast.error("Minimum balance amount is 100");
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
        toast.error("Unable to start payment. Please try again.");
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
        error?.response?.data?.message || "Failed to start payment process"
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading subscription information...</p>
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
          <strong>Welcome!</strong> To start using the platform, you need to pay your annual
          subscription fee. You can also add a prepaid balance to your wallet in the same
          transaction.
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
              <CardTitle className="text-base">Annual Subscription Fee</CardTitle>
              <CardDescription className="text-xs">Required to activate your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-600 mb-1">Annual Platform Access</p>
                <p className="text-sm text-slate-500">
                  Full access to all features for 12 months
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">Required</Badge>
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
              <CardTitle className="text-base">Add Wallet Balance</CardTitle>
              <CardDescription className="text-xs">
                Optional prepaid balance for platform operations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customBalance">
              Wallet Balance Amount
              <Badge variant="outline" className="ml-2">Optional</Badge>
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
                placeholder="0.00"
                value={customBalance}
                onChange={(e) => setCustomBalance(e.target.value)}
                className="pl-14 text-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              Minimum {currency} 100 if adding balance. Platform costs will be deducted from this wallet.
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>Prepaid Wallet Model:</strong> Merchant payments go 100% to your Stripe
              account. Platform costs are automatically deducted from this prepaid wallet balance.
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
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subscription Fee:</span>
              <span className="font-semibold">
                {currency} {subscriptionFee.toLocaleString()}
              </span>
            </div>
            {Number(customBalance) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Wallet Balance:</span>
                <span className="font-semibold">
                  +{currency} {Number(customBalance).toLocaleString()}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">Total Payment:</span>
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
                Redirecting to Stripe...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Pay {currency} {totalAmount.toLocaleString()} with Stripe
              </>
            )}
          </Button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100/50">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider leading-tight">
                Secure Payment
              </p>
              <p className="text-[10px] font-medium text-emerald-600/70 leading-tight">
                SSL Encrypted Stripe Gateway
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm">What&apos;s Included with Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Unlimited merchant accounts",
              "WhatsApp messaging integration",
              "QR code generation",
              "Coupon management system",
              "Review collection tools",
              "Analytics & reporting",
              "Chat support system",
              "12 months platform access",
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
