import React, { useState, useEffect } from "react";
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
import { Loader2, Save, Calendar } from "lucide-react";
import BatchSelector from "../components/BatchSelector";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function FestivalForm({
  open,
  onOpenChange,
  festival,
  merchantId,
  onSuccess,
}) {
  const t = useTranslations("merchantFestival");
  const isEditMode = !!festival;

  const [formData, setFormData] = useState({
    festivalName: "",
    message: "",
    festivalDate: "",
    isActive: true,
    isRecurring: false,
    batchId: null,
  });
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes or festival changes
  useEffect(() => {
    if (open) {
      if (festival) {
        setFormData({
          festivalName: festival.festival_name || "",
          message: festival.message || "",
          festivalDate: festival.festival_date
            ? new Date(festival.festival_date).toISOString().slice(0, 10)
            : "",
          isActive: festival.is_active ?? true,
          isRecurring: festival.is_recurring ?? false,
          batchId: festival.coupon_batch_id || null,
        });
      } else {
        setFormData({
          festivalName: "",
          message: "",
          festivalDate: "",
          isActive: true,
          isRecurring: false,
          batchId: null,
        });
      }
    }
  }, [open, festival]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Validation
    if (!formData.festivalName || !formData.message || !formData.festivalDate) {
      toast.error(t("validation.allFieldsRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        festival_name: formData.festivalName,
        message: formData.message,
        festival_date: formData.festivalDate,
        is_active: formData.isActive,
        is_recurring: formData.isRecurring,
      };

      // Only include coupon_batch_id if it's set
      if (formData.batchId) {
        payload.coupon_batch_id = parseInt(formData.batchId, 10);
      }

      if (isEditMode) {
        await axiosInstance.patch(`/festival-messages/${festival.id}`, payload);
        toast.success(t("success.updated"));
      } else {
        payload.merchant_id = merchantId;
        await axiosInstance.post("/festival-messages", payload);
        toast.success(t("success.created"));
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save festival message:", error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("form.editTitle")
              : t("form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("form.editDescription")
              : t("form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t("form.festivalName")} <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Input
              placeholder={t("form.festivalNamePlaceholder")}
              value={formData.festivalName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  festivalName: e.target.value,
                }))
              }
              className="h-10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("form.festivalDate")} <span className="text-red-500">{t("form.required")}</span>
              </Label>
              <Input
                type="date"
                value={formData.festivalDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    festivalDate: e.target.value,
                  }))
                }
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t("form.couponBatch")}
              </Label>
              <BatchSelector
                selectedId={formData.batchId}
                merchantId={merchantId}
                onSelect={(id) =>
                  setFormData((prev) => ({ ...prev, batchId: id }))
                }
                placeholder={t("form.selectCouponBatch")}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t("form.festivalMessage")} <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Textarea
              placeholder={t("form.festivalMessagePlaceholder")}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold cursor-pointer">
                  {t("form.activeStatus")}
                </Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.isActive
                  ? t("form.messageActive")
                  : t("form.messageInactive")}
              </p>
            </div>

            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-semibold cursor-pointer">
                    {t("form.recurringYearly")}
                  </Label>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isRecurring: checked }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.isRecurring
                  ? t("form.repeatsEveryYear")
                  : t("form.oneTimeMessage")}
              </p>
            </div>
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
                {isEditMode
                  ? t("form.updateButton")
                  : t("form.createButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
