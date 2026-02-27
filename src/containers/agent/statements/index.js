"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Download,
  FileText,
  Building2,
  Loader2,
  User,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";
import { getAgentsColumns } from "./statement-columns";

export default function AgentStatements() {
  const t = useTranslations("agentStatements");
  const params = useParams();
  const { data: session } = useSession();
  const agentId = session?.user?.adminId;
  const router = useRouter();

  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState("all");

  // Fetch statements
  const fetchStatements = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    try {
      const params = {
        owner_type: "agent",
        owner_id: agentId,
        year: year,
        page: page + 1,
        limit: pageSize,
      };

      if (month && month !== "all") {
        params.month = month;
      }

      const response = await axiosInstance.get("/monthly-statements", {
        params,
      });

      const responseData = response.data.data || response.data;
      const statementsArray = Array.isArray(responseData) ? responseData : [];
      const metadata = response.data.meta || response.data.metadata || {};

      setStatements(statementsArray);
      setTotal(metadata.total || metadata.totalCount || statementsArray.length);
    } catch (error) {
      console.error("Failed to fetch statements:", error);
      toast.error(t("messages.fetchError"));
      setStatements([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [agentId, year, month, page, pageSize]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  // Download statement PDF
  const handleDownloadPdf = async (statementId) => {
    try {
      const response = await axiosInstance.get(
        `/monthly-statements/${statementId}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agent-statement-${statementId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t("messages.downloadSuccess"));
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error(t("messages.downloadError"));
    }
  };

  const columns = getAgentsColumns(handleDownloadPdf, t);

  // Generate available years (current year and 2 previous years)
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const months = [
    { value: "1", label: t("months.january") },
    { value: "2", label: t("months.february") },
    { value: "3", label: t("months.march") },
    { value: "4", label: t("months.april") },
    { value: "5", label: t("months.may") },
    { value: "6", label: t("months.june") },
    { value: "7", label: t("months.july") },
    { value: "8", label: t("months.august") },
    { value: "9", label: t("months.september") },
    { value: "10", label: t("months.october") },
    { value: "11", label: t("months.november") },
    { value: "12", label: t("months.december") },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {t("filters.title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("filters.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("filters.year.label")}
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("filters.year.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("filters.month.label")}
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("filters.month.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.month.all")}</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("filters.quickActions.label")}
              </label>
              <Button
                variant="outline"
                className="w-full h-9 hover:bg-muted transition-colors"
                onClick={fetchStatements}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("filters.quickActions.loading")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("filters.quickActions.refresh")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statements Table */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {t("table.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {total === 1 ? t("table.description", { count: total }) : t("table.description_plural", { count: total })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("table.loading")}
              </p>
            </div>
          ) : statements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("table.noData.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {t("table.noData.description")}
              </p>
            </div>
          ) : (
            <DataTable
              data={statements}
              columns={columns}
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
