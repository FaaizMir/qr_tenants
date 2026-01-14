"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";
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

  const tAgentEarnings = useTranslations("dashboard.agentEarnings");

  useEffect(() => {
    if (!adminId) return;

    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/wallets/admin/${adminId}/transactions`, {
          params: {
            page: 1,
            limit: 100, // Fetch more to allow for client-side aggregation
            type: "commission",
          },
        });

        const rawData = res.data.data || [];

        // Grouping by merchant_id and source (merchant type)
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
              merchant: meta.merchant_id ? `Merchant #${meta.merchant_id}` : "Unknown",
              totalSales: 0,
              commission: 0,
              rate: meta.commission_rate ? `${(meta.commission_rate * 100).toFixed(1)}%` : "—",
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
        console.error("Failed to fetch earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [adminId]);

  const KpiData = [
    {
      title: tAgentEarnings("totalearnings"),
      value: `$${stats.totalEarned.toLocaleString()}`,
      icon: DollarSign,
      trend: "up",
      trendValue: "Live Data",
    },
    {
      title: "Active Merchants",
      value: earnings.length.toString(),
      icon: TrendingUp,
    },
    {
      title: "Earnings Type",
      value: "Prepaid ",
      icon: Lock,
    }
  ];

  const EarningColumns = earningsColumns(tAgentEarnings);

  const filteredEarnings = earnings.filter((item) =>
    item.merchant.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.source?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {KpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} className="border-muted/60 shadow-sm" />
        ))}
      </div>

      <div className="grid gap-6">
        {/* Main Breakdown Table - Now Full Width */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>{tAgentEarnings("commissionbreakdown")}</CardTitle>
            <CardDescription className="text-xs">Consolidated commissions per merchant.</CardDescription>
          </CardHeader>
          <CardContent>
            <TableToolbar
              placeholder="Search merchant or source..."
              onSearchChange={setSearch}
            />
            <DataTable
              data={filteredEarnings}
              columns={EarningColumns}
              page={page}
              pageSize={pageSize}
              total={total}
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
