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
import { getMerchantsColumns } from "./statement-columns";

export default function MerchantStatements() {
  const t = useTranslations("merchantStatements");
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
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
    if (!merchantId) return;

    setLoading(true);
    try {
      const params = {
        owner_type: "merchant",
        owner_id: merchantId,
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

      setStatements(statementsArray);
      setTotal(statementsArray.length);
    } catch (error) {
      console.error("Failed to fetch statements:", error);
      toast.error(t("index.toasts.loadFailed"));
      setStatements([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [merchantId, year, month, page, pageSize]);

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
      link.download = `merchant-statement-${statementId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t("index.toasts.downloadSuccess"));
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error(t("index.toasts.downloadFailed"));
    }
  };

  const columns = getMerchantsColumns(handleDownloadPdf, t);

  // Generate available years (current year and 2 previous years)
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const months = [
    { value: "1", label: t("index.months.january") },
    { value: "2", label: t("index.months.february") },
    { value: "3", label: t("index.months.march") },
    { value: "4", label: t("index.months.april") },
    { value: "5", label: t("index.months.may") },
    { value: "6", label: t("index.months.june") },
    { value: "7", label: t("index.months.july") },
    { value: "8", label: t("index.months.august") },
    { value: "9", label: t("index.months.september") },
    { value: "10", label: t("index.months.october") },
    { value: "11", label: t("index.months.november") },
    { value: "12", label: t("index.months.december") },
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
              {t("index.title")}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {t("index.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {t("index.filters.title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("index.filters.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("index.filters.year")}
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("index.filters.selectYear")} />
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
                {t("index.filters.month")}
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("index.filters.currentMonth")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("index.filters.currentMonth")}</SelectItem>
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
                {t("index.filters.quickActions")}
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
                    {t("index.filters.loading")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("index.filters.refreshList")}
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
                {t("index.table.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {total} {total !== 1 ? t("index.table.statementsFoundPlural") : t("index.table.statementsFound")} {t("index.table.found")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("index.table.loadingStatements")}
              </p>
            </div>
          ) : statements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("index.empty.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {t("index.empty.description")}
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
