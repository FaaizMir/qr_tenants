"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Filter, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import useDebounce from "@/hooks/useDebounceRef";
import { getFestivalColumns } from "./festival-columns";
import FestivalForm from "./festival-form";
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

export default function FestivalMessages() {
  const t = useTranslations("merchantFestival");
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [festivals, setFestivals] = useState([]);
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
  const [editingFestival, setEditingFestival] = useState(null);

  // Feature toggle state
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Listen for settings updates from FeatureMasterControl
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail?.festival_campaign_enabled !== undefined) {
        setFeatureEnabled(event.detail.festival_campaign_enabled);
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
        setFeatureEnabled(!!settings.festival_campaign_enabled);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [merchantId]);

  // Fetch festivals when filters change
  useEffect(() => {
    const fetchFestivals = async () => {
      if (!merchantId) return;

      try {
        setLoading(true);
        if (initialLoading) setInitialLoading(true);

        const params = {
          merchant_id: merchantId,
          page: page + 1,
          pageSize,
          is_active: statusFilter, // 'all', 'active', or 'inactive'
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const res = await axios.get("/festival-messages", { params });
        const data = res?.data?.data || [];
        setFestivals(Array.isArray(data) ? data : []);
        setTotal(res?.data?.meta?.total || 0);
      } catch (error) {
        console.error("Failed to fetch festival messages", error);
        toast.error(t("errors.failedToLoad"));
      } finally {
        setLoading(false);
        if (initialLoading) setInitialLoading(false);
      }
    };

    fetchFestivals();
  }, [
    merchantId,
    page,
    pageSize,
    debouncedSearch,
    statusFilter,
    initialLoading,
    refetchTrigger,
  ]);

  // Handle create
  const handleCreate = () => {
    setEditingFestival(null);
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (festival) => {
    setEditingFestival(festival);
    setDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (festivalId) => {
    try {
      await axios.delete(`/festival-messages/${festivalId}`);
      toast.success(t("success.deleted"));
      setRefetchTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete festival message:", error);
      toast.error(t("errors.failedToDelete"));
    }
  };

  // Handle success
  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingFestival(null);
    setRefetchTrigger((prev) => prev + 1);
  };

  // Memoize columns to prevent re-creation on every render
  const columns = useMemo(
    () => getFestivalColumns(handleEdit, handleDelete, t),
    [t],
  );

  // Loading skeleton
  if (initialLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="p-4 border-b border-border/40 flex gap-4">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-40" />
          </div>
          <CardContent className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleCreate}
                    disabled={!featureEnabled}
                    className={`bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all rounded-xl h-11 px-6 font-semibold ${!featureEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                    {t("newGreeting")}
                  </Button>
                </span>
              </TooltipTrigger>
              {!featureEnabled && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{t("enableTooltip")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {!featureEnabled && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 rounded-xl">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            {t("featureDisabled")} <strong>{t("featureSwitchboard")}</strong> {t("featureDisabledSuffix")}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="p-4 border-b border-border/40 bg-linear-to-b from-gray-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <TableToolbar
              placeholder={t("searchPlaceholder")}
              onSearchChange={(value) => {
                setPage(0);
                setSearch(value);
              }}
              className="border-none p-0 shadow-none bg-transparent"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 rounded-lg border-gray-200">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatus")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="inactive">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent>
          <div className="w-full px-0">
            <DataTable
              data={festivals}
              columns={columns}
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={setPage}
              setPageSize={setPageSize}
              loading={loading}
              className="border-none"
              columnNameTranslations={{
                festival_name: t("columns.festivalName"),
                message: t("columns.message"),
                festival_date: t("columns.festivalDate"),
                is_recurring: t("columns.recurring"),
                is_active: t("columns.status"),
                coupon_batch_id: t("columns.coupon"),
                actions: t("columns.actions"),
              }}
            />
          </div>
        </CardContent>
      </Card>

      <FestivalForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        festival={editingFestival}
        merchantId={merchantId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
