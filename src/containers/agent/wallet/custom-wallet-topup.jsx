"use client";

import { useState } from "react";
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
import {
  Loader2,
  Wallet,
  CheckCircle2,
  Info,
  DollarSign,
} from "lucide-react";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CustomWalletTopup({ adminId, currency, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [customBalance, setCustomBalance] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const balanceAmount = Number(customBalance) || 0;

    if (balanceAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (balanceAmount < 100) {
      toast.error("Minimum top-up amount is 100");
      return;
    }

    setProcessing(true);

    try {
      const amountCents = Math.round(balanceAmount * 100);

      // Create Stripe checkout session for wallet top-up
      const { data } = await axiosInstance.post("/stripe/create-checkout-session", {
        amount: amountCents,
        currency: currency.toLowerCase(),
        package_id: "custom_wallet_topup",
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
          id: "custom_wallet_topup",
          name: "Custom Wallet Top-Up",
          price: balanceAmount,
          currency: currency,
          type: "wallet_topup",
          wallet_balance: balanceAmount,
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

  const balanceAmount = Number(customBalance) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Alert */}
      <Alert className="border-blue-500/50 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Top Up Your Wallet:</strong> Enter the amount you want to add to your prepaid wallet balance. This balance will be used for platform operations.
        </AlertDescription>
      </Alert>

      {/* Custom Balance Input Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Enter Top-Up Amount</CardTitle>
              <CardDescription className="text-sm">
                Minimum {currency} 100 required
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customBalance" className="text-base">
              Amount to Add
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">
                {currency}
              </span>
              <Input
                id="customBalance"
                type="number"
                step="0.01"
                min="100"
                placeholder="0.00"
                value={customBalance}
                onChange={(e) => setCustomBalance(e.target.value)}
                className="pl-16 text-2xl h-14 font-semibold"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Enter the exact amount you want to add to your wallet. Platform costs will be automatically deducted from this balance.</span>
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick Select:</Label>
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  onClick={() => setCustomBalance(amount.toString())}
                  className="h-12 text-sm font-semibold"
                >
                  {amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-xs text-emerald-900">
              <strong>Instant Credit:</strong> Your wallet will be credited immediately after successful payment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {balanceAmount >= 100 && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-full text-white">
                <DollarSign className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Payment Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Wallet Top-Up:</span>
                <span className="font-semibold">
                  {currency} {balanceAmount.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Payment:</span>
                <span className="text-2xl font-black text-primary">
                  {currency} {balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={processing || balanceAmount < 100}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  Pay {currency} {balanceAmount.toLocaleString()} with Stripe
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
      )}

      {/* Info Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Prepaid Wallet Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p><strong>100% Merchant Payments:</strong> All merchant payments go directly to your Stripe account</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p><strong>Platform Costs:</strong> Automatically deducted from this prepaid wallet balance</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <p><strong>Your Profit:</strong> Merchant Payment - Platform Cost = Your Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
