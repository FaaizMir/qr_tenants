"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet, Info, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Agent Balance Alert Component
 * Displays agent's prepaid wallet balance with warnings and platform cost information
 * 
 * @param {Object} props
 * @param {number} props.balance - Current agent wallet balance
 * @param {number} props.requiredBalance - Required balance for the operation (optional)
 * @param {number} props.platformCost - Platform cost that will be deducted (optional)
 * @param {number} props.merchantPayment - Amount merchant will pay (optional)
 * @param {string} props.currency - Currency symbol (default: "RM")
 * @param {boolean} props.showTopUpButton - Whether to show top-up button (default: true)
 * @param {string} props.operationType - Type of operation: "merchant_creation", "credit_purchase", "merchant_upgrade"
 */
export function AgentBalanceAlert({
  balance = 0,
  requiredBalance = null,
  platformCost = null,
  merchantPayment = null,
  currency = "USD",
  showTopUpButton = true,
  operationType = "credit_purchase",
}) {
  const router = useRouter();

  const hasInsufficientBalance = requiredBalance !== null && balance < requiredBalance;
  const agentProfit = merchantPayment !== null && platformCost !== null 
    ? merchantPayment - platformCost 
    : null;

  // Low balance warning threshold (e.g., less than USD500)
  const isLowBalance = balance < 500 && balance >= (requiredBalance || 0);

  const getOperationLabel = () => {
    switch (operationType) {
      case "merchant_creation":
        return "annual merchant creation";
      case "merchant_upgrade":
        return "merchant upgrade to annual";
      case "credit_purchase":
        return "credit package purchase";
      default:
        return "this operation";
    }
  };

  if (hasInsufficientBalance) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-semibold">Insufficient Prepaid Balance</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Your prepaid wallet balance is insufficient for {getOperationLabel()}.
          </p>
          <div className="rounded-md bg-destructive/10 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Available Balance:</span>
              <span className="font-medium">{currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-destructive font-semibold">
              <span>Required Balance:</span>
              <span>{currency} {requiredBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-destructive border-t border-destructive/20 pt-1 mt-1">
              <span>Shortfall:</span>
              <span className="font-bold">{currency} {(requiredBalance - balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          {showTopUpButton && (
            <Button
              variant="default"
              size="sm"
              className="mt-2"
              onClick={() => router.push("/agent/wallet")}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Top Up Wallet
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLowBalance) {
    return (
      <Alert variant="warning" className={cn("mb-6 border-yellow-500/50 bg-yellow-50")}>
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle className="font-semibold text-yellow-900">Low Prepaid Balance</AlertTitle>
        <AlertDescription className="text-yellow-800">
          <p className="mb-2">
            Your prepaid wallet balance is running low. Consider topping up soon.
          </p>
          <div className="rounded-md bg-yellow-100 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span className="font-medium text-yellow-900">{currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          {showTopUpButton && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              onClick={() => router.push("/agent/wallet")}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Top Up Wallet
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Show platform cost breakdown if provided
  if (platformCost !== null) {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-900">Prepaid Wallet Deduction</AlertTitle>
        <AlertDescription className="text-blue-800">
          <p className="mb-3">
            This {getOperationLabel()} will automatically deduct the platform cost from your prepaid wallet.
          </p>
          <div className="rounded-md bg-white border border-blue-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Your Current Balance:</span>
              <span className="font-medium text-blue-900">{currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {merchantPayment !== null && (
              <div className="flex justify-between text-green-700">
                <span>Merchant Payment:</span>
                <span className="font-medium">+{currency} {merchantPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-orange-700">
              <span>Platform Cost:</span>
              <span className="font-medium">-{currency} {platformCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {agentProfit !== null && (
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2 text-blue-900 font-bold">
                <span>Your Profit:</span>
                <span>{currency} {agentProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2 text-blue-900">
              <span>Balance After:</span>
              <span className="font-semibold">{currency} {(balance - platformCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Default: just show current balance
  return (
    <Alert className="mb-6 bg-slate-50 border-slate-200">
      <Wallet className="h-5 w-5 text-slate-600" />
      <AlertTitle className="font-semibold text-slate-900">Prepaid Wallet Balance</AlertTitle>
      <AlertDescription className="text-slate-700">
        <div className="flex items-center justify-between">
          <span>Current Balance:</span>
          <span className="font-bold text-lg text-slate-900">
            {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
