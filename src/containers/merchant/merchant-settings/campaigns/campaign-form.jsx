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

export default function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  merchantId,
  onSuccess,
}) {
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
      toast.error("All fields are required");
      return;
    }

    if (formData.sendCoupons && !formData.batchId) {
      toast.error("Please select a coupon batch");
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
        toast.success("Campaign updated successfully");
      } else {
        payload.merchant_id = merchantId;
        await axiosInstance.post("/scheduled-campaigns", payload);
        toast.success("Campaign created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save campaign:", error);
      const errorMsg =
        error?.response?.data?.message ||
        (isEditMode
          ? "Failed to update campaign"
          : "Failed to create campaign");
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
            {isEditMode ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your campaign details below"
              : "Fill in the details to schedule a new campaign"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4 ">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Ex: Halloween Sale, Summer Promo"
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
                Launch Date & Time <span className="text-red-500">*</span>
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
              <Label className="text-sm font-semibold">Target Audience</Label>
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
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                    <SelectItem value="first_time">First-time Users</SelectItem>
                    <SelectItem value="returning">Returning Users</SelectItem>
                  </SelectContent>
                </Select>
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Campaign Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Hi {name}, we have a special offer just for you..."
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="min-h-24 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use {"{name}"} to personalize the message
            </p>
          </div>

          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-orange-500" />
                <Label className="text-sm font-semibold cursor-pointer">
                  Attach Coupon to Campaign
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
                  Select Coupon Batch
                </Label>
                <BatchSelector
                  selectedId={formData.batchId}
                  merchantId={merchantId}
                  onSelect={(id) =>
                    setFormData((prev) => ({ ...prev, batchId: id }))
                  }
                  placeholder="Choose a coupon batch..."
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
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Update Campaign" : "Create Campaign"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
