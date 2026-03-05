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
    payment_completed_scheduled: { label: "Scheduled", variant: "info" },
    payment_completed_active: { label: "Active", variant: "success" },
    expired: { label: "Expired", variant: "secondary" },
  };

  const status = statusMap[request.approval_status] || { 
    label: request.approval_status, 
    variant: "default" 
  };
  const expiresAt =
    request.approval_type === "homepage_coupon_push"
      ? request.couponbatch_expired_at
      : request.ad_expired_at;
  const activatedAt =
    request.approval_type === "homepage_coupon_push"
      ? request.couponbatch_created_at
      : request.ad_created_at;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3 pb-2 border-b">
            <StatusBadge status={status.label} variant={status.variant} />
            {request.forwarded_by_agent && (
              <Badge variant="outline">{t("badges.forwarded")}</Badge>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Merchant Information */}
              <div className="rounded-lg border p-5 space-y-4 bg-muted/20">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <User className="h-5 w-5" />
                  {t("sections.merchant")}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.businessName")}</p>
                      <p className="font-semibold text-base">{request.merchant?.business_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.email")}</p>
                      <p className="font-medium">{request.merchant?.email || "-"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.phone")}</p>
                      <p className="font-medium">{request.merchant?.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.city")}</p>
                      <p className="font-medium">{request.merchant?.city || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="rounded-lg border p-5 space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Package className="h-5 w-5" />
                  {t("sections.requestDetails")}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.type")}</p>
                      <p className="font-semibold">
                        {request.approval_type === "homepage_coupon_push"
                          ? t("types.coupon")
                          : t("types.ad")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.item")}</p>
                      <p className="font-semibold">
                        {request.approval_type === "homepage_coupon_push"
                          ? request.coupon?.batch?.batch_name || request.coupon?.coupon_code || "-"
                          : request.ad_type || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t("fields.createdAt")}
                      </p>
                      <p className="font-medium">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t("fields.updatedAt")}
                      </p>
                      <p className="font-medium">
                        {request.updated_at
                          ? new Date(request.updated_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t("fields.activatedAt")}
                      </p>
                      <p className="font-medium">
                        {activatedAt ? new Date(activatedAt).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t("fields.expiresAt")}
                      </p>
                      <p className="font-medium">
                        {expiresAt ? new Date(expiresAt).toLocaleString() : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Coupon Details (if coupon push) */}
              {request.approval_type === "homepage_coupon_push" && request.coupon && (
                <div className="rounded-lg border p-5 space-y-4 bg-blue-50/50 dark:bg-blue-500/5">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Package className="h-5 w-5" />
                    {t("sections.couponDetails")}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.couponCode")}</p>
                        <p className="font-mono font-semibold text-base bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                          {request.coupon.batch?.batch_name || request.coupon.coupon_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.batchName")}</p>
                        <p className="font-medium">{request.coupon.batch?.batch_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.couponStatus")}</p>
                        <StatusBadge status={request.coupon.status} />
                      </div>
                    </div>
                    {request.coupon.batch?.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.description")}</p>
                        <p className="text-sm bg-white dark:bg-gray-800 p-3 rounded border">{request.coupon.batch.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment & Placement Info (if applicable) */}
              {(request.payment_amount || request.placement || expiresAt) && (
                <div className="rounded-lg border p-5 space-y-4 bg-green-50/50 dark:bg-green-500/5">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {t("sections.paymentPlacement")}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {request.payment_amount && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.cost")}</p>
                          <p className="font-bold text-xl text-green-600 dark:text-green-400">
                            ${parseFloat(request.payment_amount).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {request.placement && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Grid className="h-4 w-4" />
                            {t("fields.slot")}
                          </p>
                          <p className="font-semibold">{request.placement}</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {expiresAt && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {t("fields.expiresAt")}
                          </p>
                          <p className="font-medium">
                            {new Date(expiresAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {request.payment_status && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.paymentStatus")}</p>
                        <StatusBadge status={request.payment_status} />
                      </div>
                    )}
                    {request.payment_intent_id && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t("fields.paymentIntentId")}</p>
                        <p className="font-mono text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border break-all">
                          {request.payment_intent_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disapproval Reason (if disapproved) - Full Width */}
          {request.disapproval_reason && (
            <div className="rounded-lg border border-destructive/50 p-5 space-y-3 bg-destructive/5">
              <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <MessageSquare className="h-5 w-5" />
                {t("sections.disapprovalReason")}
              </div>
              <p className="text-sm bg-white dark:bg-gray-800 p-3 rounded border">{request.disapproval_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
