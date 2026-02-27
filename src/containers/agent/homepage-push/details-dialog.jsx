"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  Package, 
  DollarSign, 
  Clock,
  MessageSquare,
  Grid
} from "lucide-react";

export default function DetailsDialog({ open, request, onClose }) {
  const t = useTranslations("agentHomepagePush.details");

  if (!request) return null;

  const statusMap = {
    pending_agent_review: { label: "Pending Review", variant: "warning" },
    disapproved_by_agent: { label: "Disapproved", variant: "destructive" },
    forwarded_to_superadmin: { label: "Forwarded", variant: "info" },
    rejected_by_superadmin: { label: "Rejected by Super Admin", variant: "destructive" },
    approved_pending_payment: { label: "Approved - Payment Pending", variant: "success" },
    payment_completed_active: { label: "Active", variant: "success" },
    expired: { label: "Expired", variant: "secondary" },
  };

  const status = statusMap[request.approval_status] || { 
    label: request.approval_status, 
    variant: "default" 
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <StatusBadge status={status.label} variant={status.variant} />
            {request.forwarded_by_agent && (
              <Badge variant="outline">{t("badges.forwarded")}</Badge>
            )}
          </div>

          {/* Merchant Information */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              {t("sections.merchant")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.businessName")}</p>
                <p className="font-medium">{request.merchant?.business_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.email")}</p>
                <p className="font-medium">{request.merchant?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.phone")}</p>
                <p className="font-medium">{request.merchant?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.city")}</p>
                <p className="font-medium">{request.merchant?.city || "-"}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5" />
              {t("sections.requestDetails")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.type")}</p>
                <p className="font-medium">
                  {request.approval_type === "homepage_coupon_push"
                    ? t("types.coupon")
                    : t("types.ad")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.item")}</p>
                <p className="font-medium">
                  {request.approval_type === "homepage_coupon_push"
                    ? request.coupon?.batch?.batch_name || request.coupon?.coupon_code || "-"
                    : request.ad_type || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {t("fields.createdAt")}
                </p>
                <p className="font-medium">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {t("fields.updatedAt")}
                </p>
                <p className="font-medium">
                  {request.updated_at
                    ? new Date(request.updated_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Coupon Details (if coupon push) */}
          {request.approval_type === "homepage_coupon_push" && request.coupon && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                {t("sections.couponDetails")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.couponCode")}</p>
                  <p className="font-medium font-mono">{request.coupon.batch?.batch_name || request.coupon.coupon_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.batchName")}</p>
                  <p className="font-medium">{request.coupon.batch?.batch_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.couponStatus")}</p>
                  <StatusBadge status={request.coupon.status} />
                </div>
                {request.coupon.batch?.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">{t("fields.description")}</p>
                    <p className="text-sm">{request.coupon.batch.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment & Placement Info (if applicable) */}
          {(request.payment_amount || request.placement || request.ad_expired_at) && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5" />
                {t("sections.paymentPlacement")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {request.payment_amount && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fields.cost")}</p>
                    <p className="font-medium text-lg">
                      ${parseFloat(request.payment_amount).toFixed(2)}
                    </p>
                  </div>
                )}
                {request.placement && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Grid className="h-4 w-4 inline mr-1" />
                      {t("fields.slot")}
                    </p>
                    <p className="font-medium">{request.placement}</p>
                  </div>
                )}
                {request.ad_created_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {t("fields.activatedAt")}
                    </p>
                    <p className="font-medium">
                      {new Date(request.ad_created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {request.ad_expired_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {t("fields.expiresAt")}
                    </p>
                    <p className="font-medium">
                      {new Date(request.ad_expired_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {request.payment_status && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fields.paymentStatus")}</p>
                    <StatusBadge status={request.payment_status} />
                  </div>
                )}
                {request.payment_intent_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">{t("fields.paymentIntentId")}</p>
                    <p className="font-mono text-sm">{request.payment_intent_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disapproval Reason (if disapproved) */}
          {request.disapproval_reason && (
            <div className="rounded-lg border border-destructive/50 p-4 space-y-2 bg-destructive/5">
              <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <MessageSquare className="h-5 w-5" />
                {t("sections.disapprovalReason")}
              </div>
              <p className="text-sm">{request.disapproval_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
