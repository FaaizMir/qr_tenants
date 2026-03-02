"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, Grid } from "lucide-react";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";
import useDebounce from "@/hooks/useDebounceRef";
import ApprovalDialog from "./approval-dialog";
import DetailsDialog from "./details-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getHomepagePushExpiryDate = (request) => {
  if (!request) return null;
  if (request.approval_type === "homepage_coupon_push") {
    return request.couponbatch_expired_at || null;
  }
  return request.ad_expired_at || null;
};

const getHomepagePushActivatedDate = (request) => {
  if (!request) return null;
  if (request.approval_type === "homepage_coupon_push") {
    return request.couponbatch_created_at || null;
  }
  return request.ad_created_at || null;
};

const SuperAdminRequestColumns = (t, onViewDetails, onReview) => [
  {
    accessorKey: "merchant",
    header: t("listing.columns.merchant"),
    cell: ({ row }) => row.original.merchant?.business_name || "-",
  },
  {
    accessorKey: "admin",
    header: t("listing.columns.agent"),
    cell: ({ row }) =>
      row.original.admin?.user?.name ||
      // row.original.merchant?.admin?.user?.name ||
      // row.original.admin?.name ||
      // row.original.merchant?.admin?.name ||
      "-",
  },
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
        return row.original.coupon?.batch?.batch_name || row.original.coupon?.coupon_code || "-";
      }
      return row.original.ad_type || "-";
    },
  },
  {
    accessorKey: "created_at",
    header: t("listing.columns.submittedAt"),
    cell: ({ row }) => {
      const date = row.original.created_at;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
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
        {row.original.approval_status === "forwarded_to_superadmin" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onReview(row.original)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {t("listing.actions.review")}
          </Button>
        )}
      </div>
    ),
  },
];

const ActiveItemColumns = (t) => [
  {
    accessorKey: "merchant",
    header: t("active.columns.merchant"),
    cell: ({ row }) => row.original.merchant?.business_name || "-",
  },
  {
    accessorKey: "approval_type",
    header: t("active.columns.type"),
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
    header: t("active.columns.item"),
    cell: ({ row }) => {
      if (row.original.approval_type === "homepage_coupon_push") {
        return row.original.coupon?.batch?.batch_name || row.original.coupon?.coupon_code || "-";
      }
      return row.original.ad_type || "-";
    },
  },
  {
    accessorKey: "placement",
    header: t("active.columns.slot"),
    cell: ({ row }) => row.original.placement || "-",
  },
  {
    accessorKey: "ad_created_at",
    header: t("active.columns.activatedAt"),
    cell: ({ row }) => {
      const date = getHomepagePushActivatedDate(row.original);
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "ad_expired_at",
    header: t("active.columns.expiresAt"),
    cell: ({ row }) => {
      const date = getHomepagePushExpiryDate(row.original);
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
];

export default function SuperAdminHomepagePushContainer() {
  const t = useTranslations("superAdminHomepagePush");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [slots, setSlots] = useState(null);
  const [forwardedTotal, setForwardedTotal] = useState(0);
  const [activeTotal, setActiveTotal] = useState(0);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("forwarded");
  const debouncedSearch = useDebounce(search, 500);

  const fetchForwardedRequests = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("/approvals/superadmin-forwarded");
      const data = resp?.data?.data || resp?.data || [];
      const list = Array.isArray(data) ? data : [];
      
      setForwardedRequests(list);
      setForwardedTotal(list.length);
    } catch (err) {
      toast.error(t("errors.failedToLoadForwarded"));
      console.error("Error fetching forwarded requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveItems = async () => {
    setLoading(true);
    try {
      // Fetch active homepage coupons and ads
      const [couponsResp, adsResp] = await Promise.all([
        axiosInstance.get("/approvals/homepage-coupons"),
        axiosInstance.get("/approvals/homepage-ads"),
      ]);
      
      const coupons = couponsResp?.data?.data || couponsResp?.data || [];
      const ads = adsResp?.data?.data || adsResp?.data || [];
      
      const combined = [...coupons, ...ads];
      setActiveItems(combined);
      setActiveTotal(combined.length);
    } catch (err) {
      toast.error(t("errors.failedToLoadActive"));
      console.error("Error fetching active items:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const resp = await axiosInstance.get("/approvals/available-homepage-slots");
      setSlots(resp?.data || {});
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (activeTab === "forwarded") {
      fetchForwardedRequests();
    } else {
      fetchActiveItems();
    }
  }, [activeTab, page, pageSize, debouncedSearch]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleReview = (request) => {
    setSelectedRequest(request);
    setApprovalDialogOpen(true);
  };

  const handleApprove = async (requestId) => {
    try {
      await axiosInstance.patch(`/approvals/${requestId}/approve-by-superadmin`);
      toast.success(t("success.approved"));
      fetchForwardedRequests();
      fetchSlots();
      setApprovalDialogOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.approveFailed");
      toast.error(errorMsg);
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await axiosInstance.patch(`/approvals/${requestId}/reject-by-superadmin`, {
        reason,
      });
      toast.success(t("success.rejected"));
      fetchForwardedRequests();
      fetchSlots();
      setApprovalDialogOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.rejectFailed");
      toast.error(errorMsg);
      console.error("Reject error:", err);
    }
  };

  const filteredForwardedRequests = forwardedRequests.filter((r) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      r.merchant?.business_name?.toLowerCase().includes(searchLower) ||
      r.admin?.user?.name?.toLowerCase().includes(searchLower) ||
      // r.merchant?.admin?.user?.name?.toLowerCase().includes(searchLower) ||
      r.admin?.name?.toLowerCase().includes(searchLower) ||
      // r.merchant?.admin?.name?.toLowerCase().includes(searchLower) ||
      r.approval_type?.toLowerCase().includes(searchLower) ||
      r.coupon?.batch?.batch_name?.toLowerCase().includes(searchLower) ||
      r.coupon?.coupon_code?.toLowerCase().includes(searchLower)
    );
  });

  const filteredActiveItems = activeItems.filter((r) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      r.merchant?.business_name?.toLowerCase().includes(searchLower) ||
      r.placement?.toLowerCase().includes(searchLower) ||
      r.coupon?.batch?.batch_name?.toLowerCase().includes(searchLower) ||
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
      </div>

      {/* Slots Overview */}
      {slots && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Grid className="h-4 w-4" />
                {t("slots.couponSlots")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slots.coupons?.available || 0} / {slots.coupons?.max || 10}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("slots.available")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Grid className="h-4 w-4" />
                {t("slots.adSlots")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slots.ads?.available || 0} / {slots.ads?.max || 4}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("slots.available")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forwarded">
            {t("tabs.forwarded")} ({forwardedTotal})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t("tabs.active")} ({activeTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forwarded" className="space-y-4">
          {forwardedTotal === 0 && !loading && (
            <Alert>
              <AlertDescription>
                {t("info.noForwardedRequests")}
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardContent>
              <TableToolbar
                placeholder={t("listing.searchPlaceholder")}
                onSearchChange={setSearch}
              />
              <DataTable
                columns={SuperAdminRequestColumns(t, handleViewDetails, handleReview)}
                data={filteredForwardedRequests}
                loading={loading}
                pageSize={pageSize}
                currentPage={page}
                totalItems={forwardedTotal}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeTotal === 0 && !loading && (
            <Alert>
              <AlertDescription>
                {t("info.noActiveItems")}
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardContent>
              <TableToolbar
                placeholder={t("active.searchPlaceholder")}
                onSearchChange={setSearch}
              />
              <DataTable
                columns={ActiveItemColumns(t)}
                data={filteredActiveItems}
                loading={loading}
                pageSize={pageSize}
                currentPage={page}
                totalItems={activeTotal}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApprovalDialog
        open={approvalDialogOpen}
        request={selectedRequest}
        slots={slots}
        onClose={() => setApprovalDialogOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <DetailsDialog
        open={detailsDialogOpen}
        request={selectedRequest}
        onClose={() => setDetailsDialogOpen(false)}
      />
    </div>
  );
}
