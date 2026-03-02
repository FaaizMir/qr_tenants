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
  Grid,
  UserCog
} from "lucide-react";

export default function DetailsDialog({ open, request, onClose }) {
  const t = useTranslations("superAdminHomepagePush.details");

  if (!request) return null;

  const statusMap = {
    pending_agent_review: { label: "Pending Agent Review", variant: "warning" },
    disapproved_by_agent: { label: "Disapproved by Agent", variant: "destructive" },
    forwarded_to_superadmin: { label: "Forwarded", variant: "info" },
    rejected_by_superadmin: { label: "Rejected", variant: "destructive" },
    approved_pending_payment: { label: "Approved - Payment Pending", variant: "success" },
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Information */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                {t("sections.merchant")}
              </div>
              <div className="space-y-2">
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
              </div>
            </div>

            {/* Agent Information */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserCog className="h-5 w-5" />
                {t("sections.agent")}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.agentName")}</p>
                  <p className="font-medium">
                    {request.admin?.user?.name ||
                      // request.merchant?.admin?.user?.name ||
                      // request.admin?.name ||
                      // request.merchant?.admin?.name ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.agentEmail")}</p>
                  <p className="font-medium">
                    {request.admin?.user?.email ||
                      // request.merchant?.admin?.user?.email ||
                      // request.admin?.email ||
                      // request.merchant?.admin?.email ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fields.agentPhone")}</p>
                  <p className="font-medium">
                    {request.admin?.user?.phone ||
                      // request.merchant?.admin?.user?.phone ||
                      // request.admin?.phone ||
                      // request.merchant?.admin?.phone ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5" />
              {t("sections.requestDetails")}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.type")}</p>
                <Badge>
                  {request.approval_type === "homepage_coupon_push"
                    ? t("types.coupon")
                    : t("types.ad")}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("fields.item")}</p>
                <p className="font-medium font-mono">
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
                    ? new Date(request.created_at).toLocaleDateString()
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

          {/* Payment & Placement Info */}
          {(request.payment_amount || request.placement || expiresAt) && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5" />
                {t("sections.paymentPlacement")}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {activatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {t("fields.activatedAt")}
                    </p>
                    <p className="font-medium">
                      {new Date(activatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {expiresAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {t("fields.expiresAt")}
                    </p>
                    <p className="font-medium">
                      {new Date(expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disapproval/Rejection Reason */}
          {request.disapproval_reason && (
            <div className="rounded-lg border border-destructive/50 p-4 space-y-2 bg-destructive/5">
              <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <MessageSquare className="h-5 w-5" />
                {t("sections.reason")}
              </div>
              <p className="text-sm">{request.disapproval_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
