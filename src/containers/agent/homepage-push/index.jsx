"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";
import useDebounce from "@/hooks/useDebounceRef";
import ReviewDialog from "./review-dialog";
import DetailsDialog from "./details-dialog";

const AgentRequestColumns = (t, onViewDetails, onReview) => [
  {
    accessorKey: "merchant",
    header: t("listing.columns.merchant"),
    cell: ({ row }) => row.original.merchant?.business_name || "-",
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
        pending_agent_review: { label: "Pending Review", variant: "warning" },
        disapproved_by_agent: { label: "Disapproved", variant: "destructive" },
        forwarded_to_superadmin: { label: "Forwarded", variant: "info" },
        rejected_by_superadmin: { label: "Rejected by Super Admin", variant: "destructive" },
        approved_pending_payment: { label: "Approved - Payment Pending", variant: "success" },
        payment_completed_active: { label: "Active", variant: "success" },
        expired: { label: "Expired", variant: "secondary" },
      };
      const status = statusMap[row.original.approval_status] || { 
        label: row.original.approval_status, 
        variant: "default" 
      };
      return <StatusBadge status={status.label} variant={status.variant} />;
    },
  },
  {
    accessorKey: "created_at",
    header: t("listing.columns.createdAt"),
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
        {row.original.approval_status === "pending_agent_review" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onReview(row.original)}
          >
            <Send className="h-4 w-4 mr-1" />
            {t("listing.actions.review")}
          </Button>
        )}
      </div>
    ),
  },
];

export default function AgentHomepagePushContainer() {
  const t = useTranslations("agentHomepagePush");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const debouncedSearch = useDebounce(search, 500);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get("/approvals/agent-pending");
      const data = resp?.data?.data || resp?.data || [];
      const list = Array.isArray(data) ? data : [];
      
      setPendingRequests(list);
      setPendingTotal(list.length);
    } catch (err) {
      toast.error(t("errors.failedToLoadPending"));
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      // Get all homepage push requests for this agent's merchants
      const resp = await axiosInstance.get("/approvals", {
        params: {
          page: page + 1,
          pageSize,
          approval_type: "homepage_coupon_push,homepage_ad_push",
        },
      });
      const data = resp?.data?.data || resp?.data || [];
      const list = Array.isArray(data) ? data : data.approvals || [];
      
      setAllRequests(list);
      setAllTotal(list.length);
    } catch (err) {
      toast.error(t("errors.failedToLoadAll"));
      console.error("Error fetching all requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingRequests();
    } else {
      fetchAllRequests();
    }
  }, [activeTab, page, pageSize, debouncedSearch]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleReview = (request) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleForward = async (requestId) => {
    try {
      await axiosInstance.patch(`/approvals/${requestId}/forward-to-superadmin`);
      toast.success(t("success.forwarded"));
      fetchPendingRequests();
      if (activeTab === "all") {
        fetchAllRequests();
      }
      setReviewDialogOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.forwardFailed");
      toast.error(errorMsg);
      console.error("Forward error:", err);
    }
  };

  const handleDisapprove = async (requestId, reason) => {
    try {
      await axiosInstance.patch(`/approvals/${requestId}/disapprove-by-agent`, {
        reason,
      });
      toast.success(t("success.disapproved"));
      fetchPendingRequests();
      if (activeTab === "all") {
        fetchAllRequests();
      }
      setReviewDialogOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("errors.disapproveFailed");
      toast.error(errorMsg);
      console.error("Disapprove error:", err);
    }
  };

  const filteredPendingRequests = pendingRequests.filter((r) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      r.merchant?.business_name?.toLowerCase().includes(searchLower) ||
      r.approval_type?.toLowerCase().includes(searchLower) ||
      r.coupon?.coupon_code?.toLowerCase().includes(searchLower)
    );
  });

  const filteredAllRequests = allRequests.filter((r) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      r.merchant?.business_name?.toLowerCase().includes(searchLower) ||
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            {t("tabs.pending")} ({pendingTotal})
          </TabsTrigger>
          <TabsTrigger value="all">
            {t("tabs.all")} ({allTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent>
              <TableToolbar
                placeholder={t("listing.searchPlaceholder")}
                onSearchChange={setSearch}
              />
              <DataTable
                columns={AgentRequestColumns(t, handleViewDetails, handleReview)}
                data={filteredPendingRequests}
                loading={loading}
                pageSize={pageSize}
                currentPage={page}
                totalItems={pendingTotal}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent>
              <TableToolbar
                placeholder={t("listing.searchPlaceholder")}
                onSearchChange={setSearch}
              />
              <DataTable
                columns={AgentRequestColumns(t, handleViewDetails, handleReview)}
                data={filteredAllRequests}
                loading={loading}
                pageSize={pageSize}
                currentPage={page}
                totalItems={allTotal}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReviewDialog
        open={reviewDialogOpen}
        request={selectedRequest}
        onClose={() => setReviewDialogOpen(false)}
        onForward={handleForward}
        onDisapprove={handleDisapprove}
      />

      <DetailsDialog
        open={detailsDialogOpen}
        request={selectedRequest}
        onClose={() => setDetailsDialogOpen(false)}
      />
    </div>
  );
}
