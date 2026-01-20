"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripeCheckout from "@/components/stripe/stripeCheckout";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { LoadingSpinner } from "@/helper/Loader";
import { cn } from "@/lib/utils";

const CREDIT_PACKAGES_API = "/wallets/credit-packages";

export default function MerchantPurchase() {
  const { data: session } = useSession();
  const user = session?.user;

  const merchantType = useMemo(() => {
    const rawType = user?.subscriptionType;
    return rawType?.toString?.().toLowerCase() === "annual"
      ? "annual"
      : "temporary";
  }, [user]);

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    let mounted = true;
    console.log("Fetching credit packages for merchant type:", merchantType);
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(CREDIT_PACKAGES_API, {
          params: { merchant_type: merchantType },
        });

        const data = response?.data?.data || response?.data || [];
        console.log("Fetched packages data:", data);
        if (!mounted) return;
        setPackages(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load credit packages. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPackages();
    return () => {
      mounted = false;
    };
  }, [merchantType]);

  const handlePurchase = async (pkg) => {
    const merchant_id = session?.user?.merchantId;

    console.log(
      "Initiating purchase for package:",
      pkg,
      "with merchant_id:",
      merchant_id
    );

    if (!merchant_id) {
      toast.error("Unable to determine merchant id. Please contact support.");
      return;
    }

    try {
      setPurchasingId(pkg.id);

      const payload = {
        credits: Number(pkg.credits) || 0,
        credit_type: pkg.credit_type || "general",
        amount: Number(pkg.price) || 0,
        admin_id: 1,
        description: `${pkg.name} purchase`,
        metadata: {
          package_id: pkg.id,
          package_name: pkg.name,
          package: pkg,
        },
      };

      await axiosInstance.post(
        `/wallets/merchant/${merchant_id}/add-credits`,
        payload
      );

      toast.success("Package purchased successfully.");
      setCheckoutOpen(false);
      setSelectedPackage(null);
    } catch (err) {
      console.log(
        "Purchase error:",
        err?.response?.status,
        err?.response?.data,
        err
      );
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status
          ? `Request failed with status ${err.response.status}.`
          : err?.message) ||
        "Failed to purchase package. Please try again.";
      toast.error(msg);
    } finally {
      setPurchasingId(null);
    }
  };

  const handleStartCheckout = (pkg) => {
    setSelectedPackage(pkg);
    setCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
          Power Up Your Store
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Choose a credit package for WhatsApp messages, coupon creation, and
          paid ads.
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-muted-foreground/20 bg-muted/10 p-6 text-muted-foreground">
          No credit packages found for your merchant type.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => {
            const price = Number(pkg.price || 0);
            const currency = pkg.currency || "USD";

            const getCategoryTheme = (type) => {
              const t = type?.toLowerCase() || "";
              if (t.includes("coupon"))
                return {
                  label: "Coupon",
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                  badge: "bg-blue-100/80 text-blue-700 border-blue-200",
                };
              if (t.includes("whatsapp"))
                return {
                  label: "Whatsapp Message",
                  icon: <Sparkles className="h-4 w-4" />,
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                  badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
                };
              if (t.includes("ad"))
                return {
                  label: "Paid Ads",
                  icon: <Wallet className="h-4 w-4" />,
                  bg: "bg-violet-50",
                  text: "text-violet-600",
                  badge: "bg-violet-100/80 text-violet-700 border-violet-200",
                };
              return {
                label: type || "Standard",
                icon: <Zap className="h-4 w-4" />,
                bg: "bg-slate-50",
                text: "text-slate-600",
                badge: "bg-slate-100 text-slate-700 border-slate-200",
              };
            };
            const theme = getCategoryTheme(pkg.credit_type);

            return (
              <Card
                key={pkg.id}
                className="relative flex flex-col h-full border-muted/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group bg-white"
              >

                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-colors duration-300",
                        theme.bg,
                        theme.text
                      )}
                    >
                      {theme.icon}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                        theme.badge
                      )}
                    >
                      {theme.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-foreground">
                      {pkg.name}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                        pkg.merchant_type?.toLowerCase() === "annual"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {pkg.merchant_type || "Standard"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-1 mt-1">
                    {pkg.description || "Enhanced features and capacity"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {currency} {price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium uppercase tracking-widest">
                      {currency}{" "}
                      {pkg.price_per_credit || (price / pkg.credits).toFixed(2)}{" "}
                      per credit
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="font-medium text-foreground">
                        {pkg.credits} Base Credits
                      </span>
                    </div>
                    {pkg.bonus_credits > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-emerald-600">
                          +{pkg.bonus_credits} Bonus Credits
                        </span>
                      </div>
                    )}

                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl font-semibold transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-[1.02]"
                    onClick={() => handleStartCheckout(pkg)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
                    {/* Selected Package Highlight */}
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

                    {/* Breakdown */}
                    <div className="space-y-3 px-1">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Credits Included</span>
                        <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-full">{selectedPackage.credits}</span>
                      </div>

                      {selectedPackage.bonus_credits > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-500">Bonus Gift</span>
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">+{selectedPackage.bonus_credits}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-500">Package Type</span>
                        <Badge variant="outline" className="capitalize text-[10px] h-6 font-bold border-slate-200 bg-white">
                          {selectedPackage.credit_type || "Standard"}
                        </Badge>
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

              {/* Secure Badge */}
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
              {selectedPackage ? (
                <div className="h-full flex flex-col justify-center">
                  {/* Payment Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Card Details</h3>
                    <p className="text-sm text-slate-500 font-medium">Please enter your payment information below.</p>
                  </div>

                  {/* Payment Form Area */}
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
                        onSuccess={() => handlePurchase(selectedPackage)}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trusted Partners</p>
                      <div className="flex gap-6 items-center opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 pointer-events-none">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                          alt="Visa"
                          className="h-3"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-5"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                          alt="Stripe"
                          className="h-4"
                        />
                      </div>
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
                    Please close this window and select a credit package to proceed with your upgrade.
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
