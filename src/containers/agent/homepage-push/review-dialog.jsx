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
import { Loader2, Send, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReviewDialog({ open, request, onClose, onForward, onDisapprove }) {
  const t = useTranslations("agentHomepagePush.review");
  const [action, setAction] = useState(null); // 'forward' or 'disapprove'
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === "disapprove" && !reason.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      if (action === "forward") {
        await onForward(request.id);
      } else if (action === "disapprove") {
        await onDisapprove(request.id, reason);
      }
      setReason("");
      setAction(null);
    } catch (err) {
      console.error("Review submission error:", err);
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
                <p className="text-base">{request.merchant?.business_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.type")}
                </p>
                <p className="text-base">
                  {request.approval_type === "homepage_coupon_push"
                    ? t("types.coupon")
                    : t("types.ad")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.item")}
                </p>
                <p className="text-base">
                  {request.approval_type === "homepage_coupon_push"
                    ? request.coupon?.coupon_code || "-"
                    : request.ad_type || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.createdAt")}
                </p>
                <p className="text-base">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            {request.approval_type === "homepage_coupon_push" && request.coupon && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.couponDetails")}
                </p>
                <p className="text-sm">
                  {t("fields.batch")}: {request.coupon.batch?.batch_name || "-"}
                </p>
                {request.coupon.batch?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.coupon.batch.description}
                  </p>
                )}
              </div>
            )}
          </div>

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
                  onClick={() => setAction("forward")}
                >
                  <Send className="h-5 w-5" />
                  <span>{t("actions.forward")}</span>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setAction("disapprove")}
                >
                  <XCircle className="h-5 w-5" />
                  <span>{t("actions.disapprove")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Forward Confirmation */}
          {action === "forward" && (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  {t("info.forwardConfirm")}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Disapprove Reason */}
          {action === "disapprove" && (
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
                disabled={submitting || (action === "disapprove" && !reason.trim())}
                variant={action === "forward" ? "default" : "destructive"}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action === "forward" ? t("buttons.confirmForward") : t("buttons.confirmDisapprove")}
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
