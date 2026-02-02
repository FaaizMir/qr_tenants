"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Filter, Download, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import useDebounce from "@/hooks/useDebounceRef";
import { getCampaignColumns } from "./campaign-columns";
import CampaignFormDialog from "./campaign-form";
import { toast } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MerchantCampaigns() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 500);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Feature toggle state
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Listen for settings updates from FeatureMasterControl
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail?.scheduled_campaign_enabled !== undefined) {
        setFeatureEnabled(event.detail.scheduled_campaign_enabled);
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", handleSettingsUpdate);
    return () =>
      window.removeEventListener(
        "MERCHANT_SETTINGS_UPDATED",
        handleSettingsUpdate,
      );
  }, []);

  // Fetch settings once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!merchantId) return;

      try {
        const res = await axios.get(
          `/merchant-settings/merchant/${merchantId}`,
        );
        const settings = res?.data?.data || {};
        setFeatureEnabled(!!settings.scheduled_campaign_enabled);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [merchantId]);

  // Fetch campaigns when filters change
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!merchantId) return;

      try {
        setLoading(true);
        if (initialLoading) setInitialLoading(true);

        const params = {
          merchant_id: merchantId,
          page: page + 1,
          pageSize,
          search: debouncedSearch,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const res = await axios.get("/scheduled-campaigns", { params });
        const data = res?.data?.data || res?.data || [];
        setCampaigns(Array.isArray(data) ? data : []);
        setTotal(res?.data?.meta?.total || data.length);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
        if (initialLoading) setInitialLoading(false);
      }
    };

    fetchCampaigns();
  }, [
    merchantId,
    page,
    pageSize,
    debouncedSearch,
    statusFilter,
    refetchTrigger,
    initialLoading,
  ]);

  // Handle create
  const handleCreate = () => {
    setEditingCampaign(null);
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (campaignId) => {
    try {
      await axios.delete(`/scheduled-campaigns/${campaignId}`);
      toast.success("Campaign deleted successfully");
      setRefetchTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  // Handle success
  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingCampaign(null);
    setRefetchTrigger((prev) => prev + 1);
  };

  // Memoize columns to prevent re-creation on every render
  const columns = useMemo(
    () => getCampaignColumns(handleEdit, handleDelete),
    [],
  );

  // Loading skeleton
  if (initialLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card className="w-full">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full  ">
      <div className="flex items-center justify-between">
        <div className="pb-4">
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your scheduled campaigns
          </p>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleCreate}
                    disabled={!featureEnabled}
                    className={
                      !featureEnabled ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </span>
              </TooltipTrigger>
              {!featureEnabled && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>
                    Enable &quot;Scheduled Campaign&quot; in Feature Switchboard
                    to create campaigns
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {!featureEnabled && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            Scheduled campaigns are currently disabled. Enable the feature in
            the <strong>Feature Switchboard</strong> above to create new
            campaigns.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardContent className="w-full p-0">
          <div className="flex gap-3 px-6 pt-2">
            <div className="flex-1">
              <TableToolbar
                placeholder="Search campaigns..."
                onSearchChange={(value) => {
                  setPage(0);
                  setSearch(value);
                }}
                rightSlot={
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-3.5 w-3.5 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </div>
          </div>

          <div className="w-full px-6">
            <DataTable
              data={campaigns}
              columns={columns}
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={setPage}
              setPageSize={setPageSize}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      <CampaignFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        merchantId={merchantId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
