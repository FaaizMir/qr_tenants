"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateHomepagePushDialog({ open, onClose, onSuccess }) {
  const t = useTranslations("merchantHomepagePush.create");
  const [type, setType] = useState("coupon"); // 'coupon' or 'ad'
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [adPlacement, setAdPlacement] = useState("top");
  const [couponBatches, setCouponBatches] = useState([]);
  const [slots, setSlots] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch merchant coupon batches
      const batchesResp = await axiosInstance.get("/coupon-batches", {
        params: { page: 1, pageSize: 200 },
      });
      const batchesPayload = batchesResp?.data?.data ?? batchesResp?.data ?? {};
      const batchesList = Array.isArray(batchesPayload)
        ? batchesPayload
        : batchesPayload?.batches || [];
      setCouponBatches(batchesList);

      // Fetch available slots
      const slotsResp = await axiosInstance.get("/approvals/available-homepage-slots");
      setSlots(slotsResp?.data || {});

      // Fetch pricing from public endpoint
      const settingsResp = await axiosInstance.get("/super-admin-settings/homepage-placement-pricing");
      const settings = settingsResp?.data?.data || settingsResp?.data || {};
      setPricing({
        coupon: settings?.homepage_coupon_placement_cost || 50,
        ad: settings?.homepage_ad_placement_cost || 100,
        couponDuration: settings?.coupon_homepage_placement_duration_days || 7,
        adDuration: settings?.ad_homepage_placement_duration_days || 7,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error(t("errors.failedToLoadData"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === "coupon" && !selectedBatchId) {
      toast.error(t("errors.selectCoupon"));
      return;
    }

    setSubmitting(true);
    try {
      if (type === "coupon") {
        await axiosInstance.post("/approvals/homepage-coupon-push", {
          coupon_batch_id: parseInt(selectedBatchId),
        });
      } else {
        await axiosInstance.post("/approvals/homepage-ad-push", {
          ad_placement: adPlacement,
        });
      }

      toast.success(t("success.requestCreated"));
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.failedToCreate");
      toast.error(errorMsg);
      console.error("Error creating request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = type === "coupon" 
    ? slots?.coupons?.available || 0
    : slots?.ads?.available || 0;

  const cost = type === "coupon" ? pricing?.coupon : pricing?.ad;
  const duration = type === "coupon" ? pricing?.couponDuration : pricing?.adDuration;

  const availableBatches = couponBatches.filter(
    (batch) => Boolean(batch?.id) && batch?.is_active !== false,
  );
  const hasAvailableBatches = availableBatches.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Available Slots Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {type === "coupon"
                  ? t("info.availableCouponSlots", { count: availableSlots })
                  : t("info.availableAdSlots", { count: availableSlots })}
              </AlertDescription>
            </Alert>

            {availableSlots === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("errors.noSlotsAvailable")}
                </AlertDescription>
              </Alert>
            )}

            {/* Type Selection */}
            <div className="space-y-2">
              <Label>{t("fields.type.label")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coupon">
                    {t("fields.type.options.coupon")}
                  </SelectItem>
                  <SelectItem value="ad">
                    {t("fields.type.options.ad")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coupon Selection (if type is coupon) */}
            {type === "coupon" && (
              <div className="space-y-2">
                <Label>{t("fields.coupon.label")}</Label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId} disabled={!hasAvailableBatches}>
                  <SelectTrigger>
                    <SelectValue placeholder={hasAvailableBatches ? t("fields.coupon.placeholder") : "No coupon batches available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {hasAvailableBatches ? (
                      availableBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.batch_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-coupons" disabled>
                        No coupon batches available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ad Placement (if type is ad) */}
            {type === "ad" && (
              <div className="space-y-2">
                <Label>{t("fields.adType.label")}</Label>
                <Select value={adPlacement} onValueChange={setAdPlacement}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">
                      {t("fields.adType.options.top")}
                    </SelectItem>
                    <SelectItem value="left">
                      {t("fields.adType.options.left")}
                    </SelectItem>
                    <SelectItem value="right">
                      {t("fields.adType.options.right")}
                    </SelectItem>
                    <SelectItem value="bottom">
                      {t("fields.adType.options.bottom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Pricing Info */}
            {pricing && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t("pricing.cost")}</span>
                  <span className="text-sm font-bold">${cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t("pricing.duration")}</span>
                  <span className="text-sm">{duration} {t("pricing.days")}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("pricing.note")}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={submitting || availableSlots === 0 || (type === "coupon" && (!selectedBatchId || !hasAvailableBatches))}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("buttons.submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
