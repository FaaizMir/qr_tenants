"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTabs } from "@/components/common/page-tabs";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { autoDeductions } from "./wallet-data";
import { transactionColumns, deductionColumns } from "./wallet-columns";
import { getWalletTabs } from "./wallet-tabs";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";
import { useSubscription } from "@/context/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Plus, Sparkles, CheckCircle2, Wallet } from "lucide-react";
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

const CREDIT_PACKAGES_API = "/wallets/credit-packages";

export default function AgentWalletContainer() {
  const { data: session } = useSession();
  const { isSubscriptionExpired, refreshSubscription } = useSubscription();
  const adminId = session?.user?.adminId;
  const isExpired = isSubscriptionExpired;

  const tAgentWallet = useTranslations("dashboard.agentWallet");

  /** Credits Top-up */
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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

  const TransactionColumns = transactionColumns(tAgentWallet);
  const DeductionColumns = deductionColumns(tAgentWallet);

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
          }
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
   * Fetch subscription fee
   * ---------------------------------- */
  useEffect(() => {
    const fetchSubscriptionFee = async () => {
      try {
        setLoadingPackages(true);
        // Try to fetch from the specific subscription fee endpoint
        const res = await axiosInstance.get("/wallets/admin-subscription-fee");

        // Handle both { data: { ... } } and directly { ... }
        const rawData = res.data?.data || res.data;

        // Final fallback to /wallets/super-admin if data seems missing
        let finalData = rawData;
        if (!finalData?.fee) {
          const backupRes = await axiosInstance.get("/wallets/super-admin");
          finalData = backupRes.data?.data || backupRes.data;
        }

        const dynamicPackage = {
          id: "subscription-renewal",
          name: "Annual Subscription Renewal",
          description: "Renew your agent account for another year of full access.",
          credits: "Unlimited",
          price: Number(finalData?.fee || 0),
          currency: finalData?.currency || "USD",
        };

        setPackages([dynamicPackage]);
        setSelectedPackage(dynamicPackage);
      } catch (err) {
        console.error("Failed to load subscription fee:", err);
        // last ditch effort if endpoints fail completely
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchSubscriptionFee();
  }, []);

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
      t.description?.toLowerCase().includes(debouncedTxSearch.toLowerCase())
    );
  }, [transactions, debouncedTxSearch]);

  /* ----------------------------------
   * Tables
   * ---------------------------------- */
  const transactionTable = (
    <Card>
      <CardHeader>
        <CardTitle>{tAgentWallet("transactionhistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder={tAgentWallet("searchtransactions")}
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
        <CardTitle>{tAgentWallet("autodeductionslog")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder={tAgentWallet("searchdeductions")}
          onSearchChange={() => { }}
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
    tAgentWallet,
  });

  return (
    <div className="space-y-6">
      {isExpired && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg">Subscription Required
          </AlertTitle>
          <AlertDescription className="text-base">
            Choose a subscription plan to get full access to all features and start using the platform without limits.          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tAgentWallet("agentwallet")}</h1>
          <p className="text-muted-foreground">{tAgentWallet("description")}</p>
        </div>

        <Button
          onClick={() => {
            if (packages.length > 0) {
              setCheckoutOpen(true);
            } else {
              toast.error("No top-up packages available at the moment.");
            }
          }}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Renew Subscription
        </Button>
      </div>

      <PageTabs tabs={tabs} defaultTab="balance" />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
          <div className="grid md:grid-cols-12">
            {/* LEFT — Order Overview */}
            <div className="md:col-span-5 bg-slate-50/80 p-7 flex flex-col justify-between border-r border-slate-100">
              <div>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                    Order Overview
                  </DialogTitle>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 opacity-70">Checkout details</p>
                </DialogHeader>

                {selectedPackage && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                      <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <p className="font-bold text-lg text-slate-900 truncate">
                          {selectedPackage.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                        {selectedPackage.description || "Premium credit package for your business growth."}
                      </p>
                    </div>

                    <div className="space-y-3 px-1">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Credits Included</span>
                        <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-full">{selectedPackage.credits}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Amount</span>
                            <span className="text-2xl font-black text-primary tracking-tighter">
                              {selectedPackage.currency || "USD"}{" "}
                              {Number(selectedPackage.price || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100/50">
                <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-500/10 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider leading-tight">Secure Payment</p>
                  <p className="text-[10px] font-medium text-emerald-600/70 leading-tight">SSL Encrypted Stripe Gateway</p>
                </div>
              </div>
            </div>

            {/* RIGHT — Payment Input */}
            <div className="md:col-span-7 bg-white p-7 flex flex-col h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
              {packages.length > 1 && (
                <div className="mb-6 flex overflow-x-auto gap-2 pb-2">
                  {packages.map((pkg) => (
                    <Button
                      key={pkg.id}
                      variant={selectedPackage?.id === pkg.id ? "default" : "outline"}
                      className="shrink-0"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.name}
                    </Button>
                  ))}
                </div>
              )}

              {selectedPackage ? (
                <div className="h-full flex flex-col justify-center">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Card Details</h3>
                    <p className="text-sm text-slate-500 font-medium">Please enter your payment information below.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50/50 backdrop-blur-sm rounded-3xl p-5 border border-slate-100 shadow-inner transition-all hover:bg-slate-50/80">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount Payable</span>
                        <span className="text-lg font-black text-slate-900">
                          {selectedPackage.currency || "USD"}{" "}
                          {Number(selectedPackage.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200/50 mb-6" />
                      <StripeCheckout
                        pkg={selectedPackage}
                        onSuccess={() => {
                          toast.success("Wallet topped up successfully!");
                          setCheckoutOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
                  <div className="p-6 bg-slate-50 rounded-full mb-6 border border-slate-100 shadow-inner">
                    <Wallet className="h-10 w-10 text-slate-300 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">No selection found</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Please select a credit package to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
