import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Ticket, Loader2, Save, CalendarClock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BatchSelector from "../components/BatchSelector";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  merchantId,
  onSuccess,
}) {
  const t = useTranslations("merchantCampaigns");
  const isEditMode = !!campaign;

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    date: "",
    audience: "all",
    sendCoupons: false,
    batchId: null,
  });
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes or campaign changes
  useEffect(() => {
    if (open) {
      if (campaign) {
        setFormData({
          name: campaign.campaign_name || "",
          message: campaign.campaign_message || "",
          date: campaign.scheduled_date
            ? new Date(campaign.scheduled_date).toISOString().slice(0, 16)
            : "",
          audience: campaign.target_audience || "all",
          sendCoupons: campaign.send_coupons ?? false,
          batchId: campaign.coupon_batch_id || null,
        });
      } else {
        setFormData({
          name: "",
          message: "",
          date: "",
          audience: "all",
          sendCoupons: false,
          batchId: null,
        });
      }
    }
  }, [open, campaign]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Validation
    if (!formData.name || !formData.message || !formData.date) {
      toast.error(t("validation.allFieldsRequired"));
      return;
    }

    if (formData.sendCoupons && !formData.batchId) {
      toast.error(t("validation.selectCouponBatch"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        campaign_name: formData.name,
        campaign_message: formData.message,
        scheduled_date: new Date(formData.date).toISOString(),
        target_audience: formData.audience,
        send_coupons: formData.sendCoupons,
      };

      // Only include coupon_batch_id if sending coupons and batch is selected
      if (formData.sendCoupons && formData.batchId) {
        payload.coupon_batch_id = parseInt(formData.batchId, 10);
      }

      if (isEditMode) {
        // Use PUT for updates as per API documentation
        await axiosInstance.put(`/scheduled-campaigns/${campaign.id}`, payload);
        toast.success(t("success.updated"));
      } else {
        payload.merchant_id = merchantId;
        await axiosInstance.post("/scheduled-campaigns", payload);
        toast.success(t("success.created"));
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save campaign:", error);
      const errorMsg =
        error?.response?.data?.message ||
        (isEditMode
          ? t("errors.failedToUpdate")
          : t("errors.failedToCreate"));
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("form.editDescription")
              : t("form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4 ">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t("form.campaignName")} <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Input
              placeholder={t("form.campaignNamePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("form.launchDateTime")} <span className="text-red-500">{t("form.required")}</span>
              </Label>
              <div className="relative group">
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="h-10 text-sm pl-10"
                  required
                />
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("form.targetAudience")}</Label>
              <div className="relative">
                <Select
                  value={formData.audience}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, audience: val }))
                  }
                >
                  <SelectTrigger className="h-10 pl-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("form.allUsers")}</SelectItem>
                    <SelectItem value="active">{t("form.activeUsers")}</SelectItem>
                    <SelectItem value="inactive">{t("form.inactiveUsers")}</SelectItem>
                    <SelectItem value="first_time">{t("form.firstTimeUsers")}</SelectItem>
                    <SelectItem value="returning">{t("form.returningUsers")}</SelectItem>
                  </SelectContent>
                </Select>
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t("form.campaignMessage")} <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Textarea
              placeholder={t("form.campaignMessagePlaceholder")}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="min-h-24 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("form.personalizationHint")}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-orange-500" />
                <Label className="text-sm font-semibold cursor-pointer">
                  {t("form.attachCoupon")}
                </Label>
              </div>
              <Switch
                checked={formData.sendCoupons}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, sendCoupons: checked }))
                }
              />
            </div>

            {formData.sendCoupons && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">
                  {t("form.selectCouponBatch")}
                </Label>
                <BatchSelector
                  selectedId={formData.batchId}
                  merchantId={merchantId}
                  onSelect={(id) =>
                    setFormData((prev) => ({ ...prev, batchId: id }))
                  }
                  placeholder={t("form.chooseCouponBatch")}
                  className="h-10"
                />
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("form.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("form.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? t("form.updateButton") : t("form.createButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
