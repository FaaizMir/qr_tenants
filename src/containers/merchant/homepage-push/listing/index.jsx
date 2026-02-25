"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, CreditCard } from "lucide-react";
import { toast } from "@/lib/toast";
import { useLocale, useTranslations } from "next-intl";
import useDebounce from "@/hooks/useDebounceRef";
import CreateHomepagePushDialog from "./create-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HomepagePushColumns = (t, onViewDetails, onProcessPayment) => [
  {
    accessorKey: "approval_type",
    header: t("listing.columns.type"),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.approval_type === "homepage_coupon_push"
          ? t("listing.types.coupon")
          : t("listing.types.ad")}
      </span>
    ),
  },
  {
    id: "item",
    header: t("listing.columns.item"),
    cell: ({ row }) => {
      if (row.original.approval_type === "homepage_coupon_push") {
        return row.original.coupon?.coupon_code || "-";
      }
      return row.original.ad_type || "-";
    },
  },
  {
    accessorKey: "approval_status",
    header: t("listing.columns.status"),
    cell: ({ row }) => {
      const statusMap = {
        pending_agent_review: { label: "Pending Agent Review", variant: "warning" },
        disapproved_by_agent: { label: "Disapproved by Agent", variant: "destructive" },
        forwarded_to_superadmin: { label: "Forwarded to Super Admin", variant: "info" },
        rejected_by_superadmin: { label: "Rejected by Super Admin", variant: "destructive" },
        approved_pending_payment: { label: "Approved - Payment Pending", variant: "success" },
        payment_completed_active: { label: "Active", variant: "success" },
        expired: { label: "Expired", variant: "secondary" },
      };
      const status = statusMap[row.original.approval_status] || { label: row.original.approval_status, variant: "default" };
      return <StatusBadge status={status.label} variant={status.variant} />;
    },
  },
  {
    accessorKey: "payment_amount",
    header: t("listing.columns.cost"),
    cell: ({ row }) => {
      return row.original.payment_amount
        ? `$${parseFloat(row.original.payment_amount).toFixed(2)}`
        : "-";
    },
  },
  {
    accessorKey: "ad_expired_at",
    header: t("listing.columns.expiryDate"),
    cell: ({ row }) => {
      const date = row.original.ad_expired_at;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "placement",
    header: t("listing.columns.slot"),
    cell: ({ row }) => row.original.placement || "-",
  },
  {
    id: "actions",
    header: t("listing.columns.actions"),
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {row.original.approval_status === "approved_pending_payment" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onProcessPayment(row.original)}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            {t("listing.actions.pay")}
          </Button>
        )}
      </div>
    ),
  },
];

export default function HomepagePushListing() {
  const t = useTranslations("homepagePush");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const locale = useLocale();
  const debouncedSearch = useDebounce(search, 500);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Get merchant's homepage push requests
      const resp = await axiosInstance.get("/approvals", {
        params: {
          page: page + 1,
          pageSize,
          approval_type: "homepage_coupon_push,homepage_ad_push",
        },
      });
      const data = resp?.data?.data || resp?.data || resp || [];
      const list = Array.isArray(data) ? data : data.approvals || [];
      
      // Filter for current merchant's requests
      const filtered = list.filter(
        (item) =>
          item.approval_type === "homepage_coupon_push" ||
          item.approval_type === "homepage_ad_push"
      );

      setRequests(filtered);
      setTotal(filtered.length);
    } catch (err) {
      toast.error(t("errors.failedToLoadRequests"));
      console.error("Error fetching homepage push requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, pageSize, debouncedSearch]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleProcessPayment = async (request) => {
    try {
      const amount = Number(request.payment_amount || 0);
      if (amount <= 0) {
        toast.error(t("errors.paymentFailed"));
        return;
      }

      const stripePayload = {
        id: `homepage-push-${request.id}`,
        type: "homepage_push_payment",
        approval_id: request.id,
        approval_type: request.approval_type,
        price: amount,
        currency: "USD",
        name:
          request.approval_type === "homepage_coupon_push"
            ? "Homepage Coupon Placement"
            : "Homepage Ad Placement",
      };

      localStorage.setItem("stripe_package", JSON.stringify(stripePayload));

      const { data } = await axiosInstance.post("/stripe/create-checkout-session", {
        amount: Math.round(amount * 100),
        currency: "usd",
        package_id: request.id,
      });

      const sessionUrl = data?.sessionUrl;
      if (!sessionUrl) {
        toast.error(t("errors.paymentFailed"));
        return;
      }

      window.location.href = sessionUrl;
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.paymentFailed");
      toast.error(errorMsg);
      console.error("Payment error:", err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      r.approval_type?.toLowerCase().includes(searchLower) ||
      r.approval_status?.toLowerCase().includes(searchLower) ||
      r.coupon?.coupon_code?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("listing.title")}</h1>
          <p className="text-muted-foreground">{t("listing.subtitle")}</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("listing.createRequest")}
        </Button>
      </div>

      <Card>
        <CardContent>
          <TableToolbar
            placeholder={t("listing.searchPlaceholder")}
            onSearchChange={setSearch}
          />
          <DataTable
            columns={HomepagePushColumns(t, handleViewDetails, handleProcessPayment)}
            data={filteredRequests}
            loading={loading}
            pageSize={pageSize}
            currentPage={page}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <CreateHomepagePushDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchRequests();
        }}
      />

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("details.title")}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("details.type")}
                  </p>
                  <p className="text-base">
                    {selectedRequest.approval_type === "homepage_coupon_push"
                      ? t("listing.types.coupon")
                      : t("listing.types.ad")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("details.status")}
                  </p>
                  <p className="text-base">{selectedRequest.approval_status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("details.cost")}
                  </p>
                  <p className="text-base">
                    {selectedRequest.payment_amount
                      ? `$${parseFloat(selectedRequest.payment_amount).toFixed(2)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("details.slot")}
                  </p>
                  <p className="text-base">{selectedRequest.placement || "-"}</p>
                </div>
                {selectedRequest.ad_expired_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("details.expiryDate")}
                    </p>
                    <p className="text-base">
                      {new Date(selectedRequest.ad_expired_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedRequest.disapproval_reason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("details.reason")}
                    </p>
                    <p className="text-base">{selectedRequest.disapproval_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
