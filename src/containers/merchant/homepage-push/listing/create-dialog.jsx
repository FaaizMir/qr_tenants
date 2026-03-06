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
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [type, setType] = useState("coupon"); // 'coupon' or 'ad'
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [adPlacement, setAdPlacement] = useState("top");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [couponBatches, setCouponBatches] = useState([]);
  const [slots, setSlots] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  // Fetch booked dates when placement or type changes
  useEffect(() => {
    if (open && type === "ad" && adPlacement) {
      fetchBookedDatesForPlacement(adPlacement);
    }
  }, [open, type, adPlacement]);

  const fetchBookedDatesForPlacement = async (placement) => {
    setLoadingBookedDates(true);
    try {
      // Use merchant-specific endpoint to get booked dates for their admin
      const merchantId = localStorage.getItem("merchantId") || 
                        sessionStorage.getItem("merchantId");
      
      const response = await axiosInstance.get(
        `/approvals/booked-dates/${placement}/merchant/${merchantId}`
      );

      const dates = response?.data?.bookedDates || [];
      setBookedDates(dates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
      setBookedDates([]);
    } finally {
      setLoadingBookedDates(false);
    }
  };

  // Calculate end date based on start date and duration
  const getEndDate = () => {
    if (!startDate || !pricing) return "";
    
    const duration = type === "coupon" ? pricing.couponDuration : pricing.adDuration;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    
    return end.toISOString().split("T")[0];
  };

  // Check if a date is within any booked range
  const isDateBooked = (dateStr) => {
    const checkDate = new Date(dateStr);
    
    for (const booking of bookedDates) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      if (checkDate >= bookingStart && checkDate <= bookingEnd) {
        return true;
      }
    }
    
    return false;
  };

  // Check if the selected date range conflicts with any booking
  const hasDateConflict = () => {
    if (type !== "ad" || !startDate || !pricing) return false;
    
    const duration = pricing.adDuration;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    
    for (const booking of bookedDates) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Check if ranges overlap
      if (start < bookingEnd && bookingStart < end) {
        return true;
      }
    }
    
    return false;
  };

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

    // Check for date conflicts before submitting
    if (type === "ad" && hasDateConflict()) {
      toast.error(
        `The selected dates conflict with an existing booking. Please choose different dates.`
      );
      return;
    }

    setSubmitting(true);
    try {
      if (type === "coupon") {
        await axiosInstance.post("/approvals/homepage-coupon-push", {
          coupon_batch_id: parseInt(selectedBatchId),
          start_date: startDate,
        });
      } else {
        await axiosInstance.post("/approvals/homepage-ad-push", {
          ad_placement: adPlacement,
          start_date: startDate,
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
              <>
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

                {/* Show booked dates info */}
                {loadingBookedDates && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Loading booked dates for {adPlacement} placement...
                    </AlertDescription>
                  </Alert>
                )}

                {!loadingBookedDates && bookedDates.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">
                        Booked dates for {adPlacement} placement:
                      </div>
                      <div className="space-y-1 text-xs">
                        {bookedDates.map((booking, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()} - {" "}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground">
                              ({booking.status})
                            </span>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Date conflict warning */}
                {hasDateConflict() && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      ⚠️ The selected dates conflict with an existing booking. 
                      Please choose a different start date or placement.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                min={getTodayDateString()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={hasDateConflict() ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Select your preferred start date for the campaign
              </p>
            </div>

            {/* Show calculated end date */}
            {startDate && pricing && (
              <div className="space-y-2">
                <Label>End Date (Calculated)</Label>
                <Input
                  type="text"
                  value={getEndDate()}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Campaign will run for {type === "coupon" ? pricing.couponDuration : pricing.adDuration} days
                </p>
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
                {startDate && getEndDate() && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Campaign period:</div>
                      <div className="font-medium text-foreground">
                        {new Date(startDate).toLocaleDateString()} - {new Date(getEndDate()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={
                  submitting || 
                  availableSlots === 0 || 
                  (type === "coupon" && (!selectedBatchId || !hasAvailableBatches)) ||
                  (type === "ad" && hasDateConflict())
                }
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
