"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { useLocale } from "next-intl";

export default function MerchantCreateCouponContainer() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const user = session?.user;
  const subscriptionType = (user?.subscriptionType || "temporary").toString();
  const isAnnual = subscriptionType.toLowerCase() === "annual";
  const maxPerBatch = isAnnual ? 1000 : 100;
  const [loading, setLoading] = useState(false);

  // form state
  const [batchName, setBatchName] = useState("");
  const batchType = isAnnual ? "annual" : "temporary";
  const [totalQuantity, setTotalQuantity] = useState(maxPerBatch);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHalal, setIsHalal] = useState(false);
  const [templateSelection, setTemplateSelection] = useState(null);
  const [visibility, setVisibility] = useState(false);

  const templateCardRef = useRef(null);

  const limitLabel = useMemo(
    () =>
      isAnnual ? "Annual limit: 1000 coupons" : "Temporary limit: 100 coupons",
    [isAnnual]
  );

  // ✅ Reset form function
  const resetForm = () => {
    setBatchName("");
    setTotalQuantity(maxPerBatch);
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setIsHalal(false);

    setTemplateSelection(null);
    setVisibility(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const merchant_id = session?.user?.merchantId;

      if (!merchant_id) {
        toast.error("Unable to determine merchant id. Please contact support.");
        setLoading(false);
        return;
      }

      const payload = {
        merchant_id: Number(merchant_id),
        batch_name: batchName,
        batch_type: batchType,
        total_quantity: Math.min(Number(totalQuantity) || 0, maxPerBatch),
        start_date: startDate ? `${startDate}T00:00:00Z` : null,
        end_date: endDate ? `${endDate}T23:59:59Z` : null,
        is_active: Boolean(isActive),
        ishalal: Boolean(isHalal),
        visibility: Boolean(visibility),
        template_id: templateSelection?.templateId || null,
        header: templateSelection?.content?.header || "",
        title: templateSelection?.content?.title || "",
        description: templateSelection?.content?.description || "",
      };

      console.log("Payload:", payload);

      const { data } = await axiosInstance.post("/coupon-batches", payload);

      toast.success("Coupon batch created successfully!");

      // ✅ Reset form after success
      resetForm();

      // redirect to coupon list
      router.push(`/${locale}/merchant/dashboard?tab=coupons`);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create coupon batch.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/merchant/dashboard?tab=coupons`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Create Coupon Batch</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-primary font-semibold">
              {isAnnual ? "Annual Merchant" : "Temporary Merchant"}
            </span>
            <span>{limitLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Batch Details</CardTitle>
              <CardDescription>
                Configure your coupon parameters (limits are applied
                automatically)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name">Batch Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. Summer Promo 2024"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="relative">
                      <Input
                        id="quantity"
                        type="number"
                        max={maxPerBatch}
                        min={1}
                        required
                        value={totalQuantity}
                        onChange={(e) => {
                          const next = Math.max(
                            1,
                            Math.min(Number(e.target.value) || 0, maxPerBatch)
                          );
                          setTotalQuantity(next);
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Limit: {maxPerBatch} codes{" "}
                      {isAnnual ? "(Annual)" : "(Temporary)"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input
                      id="start"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input
                      id="end"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>



                <div className="space-y-2">
                  <Label>Template</Label>
                  <TemplateSelector
                    isAnnual={isAnnual}
                    onChange={setTemplateSelection}
                    cardRef={templateCardRef} // pass ref
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Public Visibility",
                      checked: visibility,
                      onChange: setVisibility,
                      desc: "Show on marketplace",
                      isSwitch: true
                    },
                    {
                      label: "Active Status",
                      checked: isActive,
                      onChange: setIsActive,
                      desc: "Enable for redemption",
                    },
                    {
                      label: "Halal Certified",
                      checked: isHalal,
                      onChange: setIsHalal,
                      desc: "Indicate compliance",
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-muted/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition cursor-pointer"
                    >
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium leading-none">
                          {item.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.desc}
                        </p>
                      </div>
                      {item.isSwitch ? (
                        <Switch
                          checked={item.checked}
                          onCheckedChange={item.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-lg border-zinc-200 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                          checked={item.checked}
                          onChange={(e) => item.onChange(e.target.checked)}
                        />
                      )}
                    </label>
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Generating Codes..." : "Generate Batch"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Tips */}
        <div className="space-y-6">
          <Card className="bg-linear-to-br from-primary/5 to-background border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use concise, campaign-specific batch names.</p>
              <p>• Set start/end dates to control redemption windows.</p>
              <p>• Annual: up to 1000 codes per batch. Temporary: up to 100.</p>
              <p>• Keep the batch active to allow customers to redeem immediately.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
