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
        admin_id:1,
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {packages.map((pkg, idx) => {
            const isPopular = idx === 0;
            const price = Number(pkg.price || 0);
            const currency = pkg.currency || "USD";
            return (
              <Card
                key={pkg.id}
                className="relative flex h-full flex-col overflow-hidden border border-border/70 bg-card/60 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/70 via-primary to-primary/70" />
                <CardHeader className="space-y-2 pb-0 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {pkg.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize px-2.5 py-1 text-xs">
                      {pkg.merchant_type || merchantType}
                    </Badge>
                  </div>
                  {isPopular && (
                    <Badge variant="outline" className="w-fit text-xs bg-primary/10 text-primary">
                      Recommended
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold leading-tight">
                        {currency} {price.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pkg.price_per_credit
                          ? `${currency} ${pkg.price_per_credit} per credit`
                          : "Flexible pricing"}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                      {pkg.credit_type || "general"} credits
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <p className="text-muted-foreground">Credits</p>
                      <p className="text-lg font-semibold">{pkg.credits}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <p className="text-muted-foreground">Bonus</p>
                      <p className="text-lg font-semibold">{pkg.bonus_credits || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <p className="text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold capitalize">
                        {pkg.credit_type || "general"}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <p className="text-muted-foreground">Sort Order</p>
                      <p className="text-sm font-semibold">{pkg.sort_order ?? "-"}</p>
                    </div>
                  </div>

                  <Button
                    className="mt-auto w-full"
                    variant="default"
                    size="sm"
                    disabled={Boolean(purchasingId) && purchasingId === pkg.id}
                    onClick={() => handleStartCheckout(pkg)}
                  >
                    {purchasingId === pkg.id ? "Processing..." : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
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
