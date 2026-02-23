"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ApprovalDialog({ open, request, slots, onClose, onApprove, onReject }) {
  const t = useTranslations("superAdminHomepagePush.approval");
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === "reject" && !reason.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      if (action === "approve") {
        await onApprove(request.id);
      } else if (action === "reject") {
        await onReject(request.id, reason);
      }
      setReason("");
      setAction(null);
    } catch (err) {
      console.error("Approval submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setReason("");
    onClose();
  };

  if (!request) return null;

  const requestType = request.approval_type === "homepage_coupon_push" ? "coupon" : "ad";
  const availableSlots = requestType === "coupon" 
    ? slots?.coupons?.available || 0
    : slots?.ads?.available || 0;
  const hasAvailableSlots = availableSlots > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.merchant")}
                </p>
                <p className="text-base font-medium">{request.merchant?.business_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.agent")}
                </p>
                <p className="text-base">{request.admin?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.type")}
                </p>
                <Badge variant="outline">
                  {request.approval_type === "homepage_coupon_push"
                    ? t("types.coupon")
                    : t("types.ad")}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.item")}
                </p>
                <p className="text-base font-mono">
                  {request.approval_type === "homepage_coupon_push"
                    ? request.coupon?.coupon_code || "-"
                    : request.ad_type || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.submittedAt")}
                </p>
                <p className="text-base">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            {request.approval_type === "homepage_coupon_push" && request.coupon?.batch && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("fields.couponBatch")}
                </p>
                <p className="text-sm">{request.coupon.batch.batch_name}</p>
                {request.coupon.batch.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.coupon.batch.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Slot Availability */}
          <Alert variant={hasAvailableSlots ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {requestType === "coupon"
                ? t("info.couponSlots", { count: availableSlots, max: slots?.coupons?.max || 10 })
                : t("info.adSlots", { count: availableSlots, max: slots?.ads?.max || 4 })}
            </AlertDescription>
          </Alert>

          {!hasAvailableSlots && (
            <Alert variant="destructive">
              <AlertDescription>
                {t("errors.noSlotsAvailable")}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          {!action && (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  {t("info.selectAction")}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="default"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setAction("approve")}
                  disabled={!hasAvailableSlots}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{t("actions.approve")}</span>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setAction("reject")}
                >
                  <XCircle className="h-5 w-5" />
                  <span>{t("actions.reject")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Approve Confirmation */}
          {action === "approve" && (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  {t("info.approveConfirm")}
                </AlertDescription>
              </Alert>
              <div className="rounded-lg border p-4 bg-success/5 space-y-2">
                <p className="text-sm font-medium">{t("info.afterApproval")}</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>{t("info.merchantWillPay")}</li>
                  <li>{t("info.agentWalletDeducted")}</li>
                  <li>{t("info.slotAssigned")}</li>
                  <li>{t("info.expirySet")}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Reject Reason */}
          {action === "reject" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">{t("fields.reason")}</Label>
                <Textarea
                  id="reason"
                  placeholder={t("fields.reasonPlaceholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
                {!reason.trim() && (
                  <p className="text-sm text-destructive">
                    {t("errors.reasonRequired")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {action ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAction(null)}
                disabled={submitting}
              >
                {t("buttons.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || (action === "reject" && !reason.trim())}
                variant={action === "approve" ? "default" : "destructive"}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action === "approve" ? t("buttons.confirmApprove") : t("buttons.confirmReject")}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("buttons.cancel")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
