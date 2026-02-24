"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTabs } from "@/components/common/page-tabs";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { autoDeductions } from "./wallet-data";
import { transactionColumns, deductionColumns } from "./wallet-columns";
import { getWalletTabs } from "./wallet-tabs";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";
import { useSubscription } from "@/context/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Plus,
  Sparkles,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripeCheckout from "@/components/stripe/stripeCheckout";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { walletTopUpPackages } from "./wallet-topup-packages";
import { InitialSubscriptionPayment } from "./initial-subscription-payment";
import { CustomWalletTopup } from "./custom-wallet-topup";

const CREDIT_PACKAGES_API = "/wallets/credit-packages";

export default function AgentWalletContainer() {
  const { data: session } = useSession();
  const { isSubscriptionExpired, refreshSubscription } = useSubscription();
  const adminId = session?.user?.adminId;
  const isExpired = isSubscriptionExpired;

  /** Top-Up Packages */
  const [topUpPackages] = useState(walletTopUpPackages);

  /** Credits Top-up */
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customTopupOpen, setCustomTopupOpen] = useState(false);
  const [initialSubscriptionOpen, setInitialSubscriptionOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  /** Pagination + search */
  const [txPage, setTxPage] = useState(0);
  const [txSize, setTxSize] = useState(10);
  const [txSearch, setTxSearch] = useState("");
  const debouncedTxSearch = useDebounce(txSearch, 500);

  /** Wallet stats */
  const [walletStats, setWalletStats] = useState({
    balance: 0,
    pending_amount: 0,
    total_earnings: 0,
    total_spent: 0,
    currency: "USD",
    is_active: false,
    subscription_type: null,
    subscription_expires_at: null,
    admin: null,
  });

  /** Transactions */
  const [transactions, setTransactions] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const TransactionColumns = transactionColumns();
  const DeductionColumns = deductionColumns();

  /* ----------------------------------
   * Fetch wallet stats
   * ---------------------------------- */
  useEffect(() => {
    if (!adminId) return;

    const fetchWallet = async () => {
      try {
        const res = await axiosInstance.get(`/wallets/admin/${adminId}`);
        const wallet = res.data;

        setWalletStats({
          balance: Number(wallet.balance),
          pending_amount: Number(wallet.pending_amount),
          total_earnings: Number(wallet.total_earnings),
          total_spent: Number(wallet.total_spent),
          currency: wallet.currency,
          is_active: wallet.is_active,
          subscription_type: wallet.subscription_type,
          subscription_expires_at: wallet.subscription_expires_at,
          admin: wallet.admin,
        });
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      }
    };

    fetchWallet();
  }, [adminId]);

  /* ----------------------------------
   * Fetch transactions (paginated)
   * ---------------------------------- */
  useEffect(() => {
    if (!adminId) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/wallets/admin/${adminId}/transactions`,
          {
            params: {
              page: txPage + 1, // backend is 1-based
              limit: txSize,
            },
          },
        );

        setTransactions(res.data.data || []);
        setTxTotal(res.data.meta.total || 0);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [adminId, txPage, txSize]);

  /* ----------------------------------
   * Initialize top-up packages
   * ---------------------------------- */
  useEffect(() => {
    // Set the default selected package (Standard - most popular)
    const defaultPackage = topUpPackages.find((pkg) => pkg.popular);
    if (defaultPackage) {
      setSelectedPackage(defaultPackage);
    }
  }, [topUpPackages]);

  const handleStartCheckout = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutOpen(true);
  };

  /* ----------------------------------
   * Search (client-side)
   * ---------------------------------- */
  const filteredTx = useMemo(() => {
    if (!debouncedTxSearch) return transactions;
    return transactions.filter((t) =>
      t.description?.toLowerCase().includes(debouncedTxSearch.toLowerCase()),
    );
  }, [transactions, debouncedTxSearch]);

  /* ----------------------------------
   * Tables
   * ---------------------------------- */
  const transactionTable = (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <TableToolbar
          placeholder="Search transactions..."
          onSearchChange={setTxSearch}
        />

        <DataTable
          data={filteredTx}
          columns={TransactionColumns}
          page={txPage}
          pageSize={txSize}
          total={txTotal}
          setPage={setTxPage}
          setPageSize={setTxSize}
          loading={loading}
        />
      </CardContent>
    </Card>
  );

  const deductionTable = (
    <Card>
      <CardHeader>
        <CardTitle>Auto Deductions Log</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder="Search deductions..."
          onSearchChange={() => {}}
        />
        <DataTable data={autoDeductions} columns={DeductionColumns} />
      </CardContent>
    </Card>
  );

  const tabs = getWalletTabs({
    walletStats,
    transactions,
    deductions: autoDeductions,
    transactionTable,
    deductionTable,
  });

  return (
    <div className="space-y-6">
      {!walletStats.is_active && (
        <div className="flex items-start gap-4 bg-amber-50 rounded-xl px-5 py-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 leading-tight mb-0.5">
              Subscription Activation Required
            </p>
            <p className="text-sm text-amber-800/70 leading-relaxed">
              Your account is not yet activated. Click &quot;Activate
              Subscription&quot; to pay your annual subscription fee and start
              using the platform. You can also add prepaid wallet balance during
              activation.
            </p>
          </div>
        </div>
      )}
      {walletStats.is_active && isExpired && (
        <div className="flex items-start gap-4 bg-amber-50 rounded-xl px-5 py-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 leading-tight mb-0.5">
              Subscription Expired
            </p>
            <p className="text-sm text-amber-800/70 leading-relaxed">
              Your subscription has expired. Renew your subscription to continue
              accessing all platform features.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Wallet</h1>
          <p className="text-muted-foreground">
            Manage your wallet balance and transactions
          </p>
        </div>

        <Button
          onClick={() => {
            // Check if agent has active subscription
            if (!walletStats.is_active) {
              // Show initial subscription payment dialog
              setInitialSubscriptionOpen(true);
            } else {
              // Show custom wallet topup for active subscriptions
              setCustomTopupOpen(true);
            }
          }}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {walletStats.is_active ? "Top Up Wallet" : "Activate Subscription"}
        </Button>
      </div>

      <PageTabs tabs={tabs} defaultTab="balance" />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 border-none shadow-2xl rounded-3xl bg-white overflow-hidden block">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[90vh]">
            {/* LEFT — Top-Up Packages Selection */}
            <div
              className="md:col-span-7 p-6 md:p-7 bg-slate-50/50 overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                  Choose Top-Up Amount
                </DialogTitle>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Select a prepaid wallet package that suits your needs
                </p>
              </DialogHeader>

              <div className="space-y-3">
                {topUpPackages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const totalAmount = pkg.amount + (pkg.bonus || 0);

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={cn(
                        "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-slate-200 bg-white hover:border-primary/50",
                      )}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-3 py-1 shadow-lg">
                            ⭐ Most Popular
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-slate-900">
                              {pkg.name}
                            </h3>
                            {pkg.bonus > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 border-green-200"
                              >
                                +{pkg.currency} {pkg.bonus} Bonus
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-3">
                            {pkg.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pkg.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-black text-slate-900">
                            {pkg.currency} {pkg.amount.toLocaleString()}
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-xs font-bold text-green-600 mt-1">
                              Get {pkg.currency} {totalAmount.toLocaleString()}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                            Payment Amount
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-4 left-4">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — Payment Details */}
            <div
              className="md:col-span-5 bg-white p-6 md:p-7 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              {selectedPackage ? (
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                      Order Summary
                    </h3>
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Package:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedPackage.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Base Amount:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedPackage.currency}{" "}
                          {selectedPackage.amount.toLocaleString()}
                        </span>
                      </div>
                      {selectedPackage.bonus > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">Bonus:</span>
                            <span className="font-semibold text-green-600">
                              +{selectedPackage.currency}{" "}
                              {selectedPackage.bonus.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-px bg-slate-200" />
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-slate-600">
                              Total Credit:
                            </span>
                            <span className="text-lg font-black text-primary">
                              {selectedPackage.currency}{" "}
                              {(
                                selectedPackage.amount + selectedPackage.bonus
                              ).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                      Payment Details
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Secure payment via Stripe. Your wallet will be credited
                      immediately.
                    </p>

                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Payment Amount
                        </span>
                        <span className="text-2xl font-black text-slate-900">
                          {selectedPackage.currency}{" "}
                          {selectedPackage.amount.toLocaleString()}
                        </span>
                      </div>
                      <StripeCheckout
                        pkg={{
                          ...selectedPackage,
                          price: selectedPackage.amount,
                          credits:
                            selectedPackage.bonus > 0
                              ? `${selectedPackage.amount + selectedPackage.bonus} (includes ${selectedPackage.bonus} bonus)`
                              : selectedPackage.amount,
                          type: "wallet_topup",
                        }}
                        onSuccess={async () => {
                          try {
                            // Credit the wallet after successful payment
                            await axiosInstance.post(
                              `/wallets/admin/${adminId}/topup`,
                              {
                                amount:
                                  selectedPackage.amount +
                                  (selectedPackage.bonus || 0),
                                description: `Wallet top-up: ${selectedPackage.name}`,
                                metadata: {
                                  package_id: selectedPackage.id,
                                  package_name: selectedPackage.name,
                                  base_amount: selectedPackage.amount,
                                  bonus_amount: selectedPackage.bonus || 0,
                                },
                              },
                            );

                            toast.success("Wallet topped up successfully!", {
                              description: `${selectedPackage.currency} ${(selectedPackage.amount + (selectedPackage.bonus || 0)).toLocaleString()} added to your balance.`,
                            });

                            setCheckoutOpen(false);

                            // Refresh wallet balance
                            const res = await axiosInstance.get(
                              `/wallets/admin/${adminId}`,
                            );
                            const wallet = res.data;
                            setWalletStats({
                              balance: Number(wallet.balance),
                              pending_amount: Number(wallet.pending_amount),
                              total_earnings: Number(wallet.total_earnings),
                              total_spent: Number(wallet.total_spent),
                              currency: wallet.currency,
                              is_active: wallet.is_active,
                              subscription_type: wallet.subscription_type,
                              subscription_expires_at:
                                wallet.subscription_expires_at,
                              admin: wallet.admin,
                            });
                          } catch (error) {
                            console.error("Failed to credit wallet:", error);
                            toast.error(
                              "Payment successful but failed to credit wallet. Please contact support.",
                            );
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100/50">
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
                  <div className="p-6 bg-slate-50 rounded-full mb-6 border border-slate-100 shadow-inner">
                    <Wallet className="h-10 w-10 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    Select a Package
                  </h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Choose a top-up amount from the options on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Wallet Top-Up Dialog */}
      <Dialog open={customTopupOpen} onOpenChange={setCustomTopupOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Top Up Your Wallet
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Add prepaid balance to your wallet for platform operations
            </p>
          </DialogHeader>
          <CustomWalletTopup
            adminId={adminId}
            currency={walletStats.currency}
            onClose={() => setCustomTopupOpen(false)}
            onSuccess={async () => {
              // Refresh wallet data after successful payment
              try {
                const res = await axiosInstance.get(
                  `/wallets/admin/${adminId}`,
                );
                const wallet = res.data;
                setWalletStats({
                  balance: Number(wallet.balance),
                  pending_amount: Number(wallet.pending_amount),
                  total_earnings: Number(wallet.total_earnings),
                  total_spent: Number(wallet.total_spent),
                  currency: wallet.currency,
                  is_active: wallet.is_active,
                  subscription_type: wallet.subscription_type,
                  subscription_expires_at: wallet.subscription_expires_at,
                  admin: wallet.admin,
                });
                setCustomTopupOpen(false);
                toast.success("Wallet topped up successfully!");
              } catch (error) {
                console.error("Failed to refresh wallet:", error);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Initial Subscription Payment Dialog */}
      <Dialog
        open={initialSubscriptionOpen}
        onOpenChange={setInitialSubscriptionOpen}
      >
        <DialogContent className="min-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Activate Your Account
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Pay your annual subscription and optionally add prepaid wallet
              balance
            </p>
          </DialogHeader>
          <InitialSubscriptionPayment
            adminId={adminId}
            onClose={() => setInitialSubscriptionOpen(false)}
            onSuccess={async () => {
              // Refresh wallet data after successful payment
              try {
                const res = await axiosInstance.get(
                  `/wallets/admin/${adminId}`,
                );
                const wallet = res.data;
                setWalletStats({
                  balance: Number(wallet.balance),
                  pending_amount: Number(wallet.pending_amount),
                  total_earnings: Number(wallet.total_earnings),
                  total_spent: Number(wallet.total_spent),
                  currency: wallet.currency,
                  is_active: wallet.is_active,
                  subscription_type: wallet.subscription_type,
                  subscription_expires_at: wallet.subscription_expires_at,
                  admin: wallet.admin,
                });
                setInitialSubscriptionOpen(false);
                toast.success("Subscription activated successfully!");
              } catch (error) {
                console.error("Failed to refresh wallet:", error);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
