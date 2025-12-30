"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/helper/Loader";
import StripeCheckout from "@/components/stripe/stripeCheckout";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const CREDIT_PACKAGES_API = "/wallets/credit-packages";

export default function MerchantPurchase() {
  const { data: session } = useSession();
  const user = session?.user;

  const merchantType = useMemo(() => {
    const rawType = user?.subscriptionType;
    return rawType?.toString?.().toLowerCase() === "annual" ? "annual" : "temporary";
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

    console.log("Initiating purchase for package:", pkg, "with merchant_id:", merchant_id);

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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Purchase Credits</h1>
        <p className="text-muted-foreground">
          Curated packages for your {merchantType} merchant plan.
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-muted-foreground/20 bg-muted/10 p-6 text-muted-foreground">
          No credit packages found for your merchant type.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {packages.map((pkg, idx) => {
            const isPopular = idx === 0;
            const price = Number(pkg.price || 0);
            const currency = pkg.currency || "USD";

            // Design configuration cycling based on index
            const styles = [
              { gradient: "from-blue-600 to-indigo-600", icon: "🚀", shadow: "shadow-indigo-500/20" },
              { gradient: "from-emerald-500 to-teal-500", icon: "💎", shadow: "shadow-emerald-500/20" },
              { gradient: "from-orange-500 to-amber-500", icon: "⚡", shadow: "shadow-orange-500/20" },
              { gradient: "from-rose-500 to-pink-600", icon: "🛡️", shadow: "shadow-rose-500/20" },
              { gradient: "from-violet-600 to-purple-600", icon: "🔮", shadow: "shadow-purple-500/20" },
            ];
            const style = styles[idx % styles.length];

            return (
              <div
                key={pkg.id}
                className="group relative flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image/Gradient Area */}
                <div className={`h-48 relative bg-gradient-to-br ${style.gradient} p-6 flex flex-col justify-between`}>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex gap-2">
                      <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {pkg.credit_type || "Credits"}
                      </span>
                      {isPopular && (
                        <span className="bg-amber-400 text-amber-900 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl shadow-inner text-white transition-transform group-hover:scale-110">
                      {style.icon}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
                      {pkg.credits} Total Credits
                    </p>
                    <h3 className="text-white text-2xl font-bold leading-tight truncate">
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Decorative shine */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {currency} {price.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {currency} {pkg.price_per_credit || "0.00"} / credit
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Credits</p>
                      <p className="text-lg font-bold text-slate-700 leading-none">{pkg.credits}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bonus</p>
                      <p className="text-lg font-bold text-slate-700 leading-none">{pkg.bonus_credits || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm font-bold text-slate-700 leading-none capitalize truncate">{pkg.credit_type || "General"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sort Order</p>
                      <p className="text-sm font-bold text-slate-700 leading-none">{pkg.sort_order ?? "-"}</p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {pkg.description || "Unlock more power for your campaigns with this credit package."}
                  </p>

                  <Button
                    className={`w-full py-6 rounded-xl text-base font-semibold shadow-none transition-all duration-300 group-hover:shadow-lg ${purchasingId === pkg.id ? "opacity-75 cursor-wait" : ""
                      }`}
                    onClick={() => handleStartCheckout(pkg)}
                    disabled={Boolean(purchasingId) && purchasingId === pkg.id}
                  >
                    {purchasingId === pkg.id ? "Processing..." : "Purchase Package"}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checkout with Stripe</DialogTitle>
          </DialogHeader>

          {selectedPackage ? (
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 space-y-2 rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold">{selectedPackage.name}</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedPackage.merchant_type || merchantType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPackage.description}
                </p>
                <div className="text-2xl font-bold">
                  {selectedPackage.currency || "USD"}{" "}
                  {Number(selectedPackage.price || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedPackage.credits} credits •{" "}
                  {selectedPackage.credit_type || "general"}
                </div>
              </div>

              <div className="md:col-span-3 space-y-4">
                <StripeCheckout
                  pkg={selectedPackage}
                  onSuccess={() => handlePurchase(selectedPackage)}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No package selected.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
