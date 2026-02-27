"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axios";
import { kpiData as getKpiData, monthlyEarnings, commissionBreakdown as mockBreakdown } from "./earnings-data";
import { earningsColumns } from "./earnings-columns";
import { KpiCard } from "@/components/common/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Download, PieChart, TrendingUp, DollarSign, Calendar, Lock, Loader2, Activity, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import useDebounce from "@/hooks/useDebounceRef";

export default function AgentEarningsContainer() {
  const t = useTranslations("agentEarnings");
  const { data: session } = useSession();
  const adminId = session?.user?.adminId;

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    avgRate: 0,
    topMerchant: "—",
  });

  useEffect(() => {
    if (!adminId) return;

    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/wallets/admin/${adminId}/transactions`, {
          params: {
            page: 1,
            limit: 100,
            type: "commission",
          },
        });

        const rawData = res.data.data || [];

        const grouped = rawData.reduce((acc, item) => {
          let meta = {};
          try {
            meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata || {};
          } catch (e) {
            console.error("Failed to parse metadata", e);
          }

          const merchantId = meta.merchant_id || "unknown";
          const sourceType = meta.credit_type ? `${meta.credit_type} purchase` : item.description;
          const groupKey = `${merchantId}_${sourceType}`;

          if (!acc[groupKey]) {
            acc[groupKey] = {
              merchant_id: merchantId,
              merchant: meta.merchant_id ? `Merchant #${meta.merchant_id}` : t("columns.noData"),
              totalSales: 0,
              commission: 0,
              rate: meta.commission_rate ? `${(meta.commission_rate * 100).toFixed(1)}%` : t("columns.noData"),
              source: sourceType,
              date: item.completed_at || item.created_at,
            };
          }

          acc[groupKey].totalSales += Number(meta.purchase_amount) || 0;
          acc[groupKey].commission += Number(item.amount) || 0;

          return acc;
        }, {});

        const processed = Object.values(grouped);

        setEarnings(processed);
        setTotal(processed.length);

        const totalEarned = processed.reduce((acc, curr) => acc + curr.commission, 0);
        setStats(prev => ({
          ...prev,
          totalEarned: totalEarned || prev.totalEarned,
        }));

      } catch (error) {
        console.error(t("errors.fetchFailed"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [adminId, t]);

  const KpiData = [
    {
      title: t("kpi.totalEarnings.title"),
      value: `$${stats.totalEarned.toLocaleString()}`,
      icon: DollarSign,
      trend: "up",
      trendValue: t("kpi.totalEarnings.trend"),
    },
    {
      title: t("kpi.activeMerchants.title"),
      value: earnings.length.toString(),
      icon: TrendingUp,
    },
    {
      title: t("kpi.earningsType.title"),
      value: t("kpi.earningsType.value"),
      icon: Lock,
    }
  ];

  const EarningColumns = earningsColumns(t);

  const filteredEarnings = useMemo(() => {
    return earnings.filter((item) =>
      item.merchant.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.source?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [earnings, debouncedSearch]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // Paginate the filtered data
  const paginatedEarnings = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEarnings.slice(startIndex, endIndex);
  }, [filteredEarnings, page, pageSize]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {KpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} className="border-muted/60 shadow-sm" />
        ))}
      </div>

      <div className="grid gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle>{t("commissionBreakdown.title")}</CardTitle>
            <CardDescription className="text-xs">{t("commissionBreakdown.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TableToolbar
              placeholder={t("commissionBreakdown.searchPlaceholder")}
              onSearchChange={setSearch}
            />
            <DataTable
              data={paginatedEarnings}
              columns={EarningColumns}
              page={page}
              pageSize={pageSize}
              total={filteredEarnings.length}
              setPage={setPage}
              setPageSize={setPageSize}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
