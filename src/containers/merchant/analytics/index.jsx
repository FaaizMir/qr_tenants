"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, MousePointerClick, Eye, BarChart3, Calendar } from "lucide-react";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import LineChart from "@/components/common/charts/line-chart";
import BarChart from "@/components/common/charts/bar-chart";
import { KpiCard } from "@/components/common/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";

const format = (num) => {
  const n = Number(num);
  return !isNaN(n) ? n.toLocaleString() : "0";
};

export default function MerchantAnalyticsContainer({ embedded = false }) {
  const { data: session } = useSession();
  const t = useTranslations("merchantDashboard.analytics");
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    ctr: 0,
    totalAds: 0,
  });

  useEffect(() => {
    if (session?.user?.merchantId) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/analytics/merchant/${session.user.merchantId}`
      );

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setAnalytics(data);

        // Calculate stats
        const totalImpressions = data.reduce((sum, item) => sum + (item.impressions || 0), 0);
        const totalClicks = data.reduce((sum, item) => sum + (item.clicks || 0), 0);
        const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

        setStats({
          totalImpressions,
          totalClicks,
          ctr,
          totalAds: data.length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error(t("errorFetchFailed") || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for impressions and clicks over time
  const prepareChartData = () => {
    if (!analytics.length) return { impressions: [], clicks: [], labels: [] };

    const sortedData = [...analytics].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    return {
      impressions: sortedData.map(item => item.impressions),
      clicks: sortedData.map(item => item.clicks),
      labels: sortedData.map((item, idx) => `Ad ${idx + 1}`),
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("title") || "Paid Ads Analytics"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("description") || "Track impressions and clicks for your paid advertisements"}
            </p>
          </div>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t("totalImpressions") || "Total Impressions"}
          value={format(stats.totalImpressions)}
          icon={Eye}
          description={t("impressionsDesc") || "Total ad views across all campaigns"}
        />
        <KpiCard
          title={t("totalClicks") || "Total Clicks"}
          value={format(stats.totalClicks)}
          icon={MousePointerClick}
          description={t("clicksDesc") || "Total ad clicks from viewers"}
        />
        <KpiCard
          title={t("clickThroughRate") || "Click-Through Rate"}
          value={`${stats.ctr}%`}
          icon={TrendingUp}
          trend={stats.ctr > 2 ? "up" : "neutral"}
          trendValue={stats.ctr > 2 ? "Good" : "Average"}
          description={t("ctrDesc") || "Percentage of impressions that converted to clicks"}
        />
        <KpiCard
          title={t("totalAds") || "Active Ads"}
          value={format(stats.totalAds)}
          icon={BarChart3}
          description={t("adsDesc") || "Total number of tracked advertisements"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title={t("impressionsChart") || "Impressions by Ad"}
          actions={
            <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
              <Eye className="w-3 h-3 mr-1" />
              {format(stats.totalImpressions)} {t("total") || "total"}
            </span>
          }
        >
          <div className="h-[300px] w-full pt-4">
            {chartData.impressions.length > 0 ? (
              <BarChart
                data={chartData.impressions}
                labels={chartData.labels}
                colors={["#3b82f6"]}
                horizontal={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("noData") || "No data available"}
              </div>
            )}
          </div>
        </ChartWrapper>

        <ChartWrapper
          title={t("clicksChart") || "Clicks by Ad"}
          actions={
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              <MousePointerClick className="w-3 h-3 mr-1" />
              {format(stats.totalClicks)} {t("total") || "total"}
            </span>
          }
        >
          <div className="h-[300px] w-full pt-4">
            {chartData.clicks.length > 0 ? (
              <BarChart
                data={chartData.clicks}
                labels={chartData.labels}
                colors={["#10b981"]}
                horizontal={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("noData") || "No data available"}
              </div>
            )}
          </div>
        </ChartWrapper>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detailedAnalytics") || "Detailed Analytics"}</CardTitle>
          <CardDescription>
            {t("detailedDesc") || "Performance breakdown for each advertisement"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adId") || "Ad ID"}</TableHead>
                    <TableHead>{t("agentId") || "Agent ID"}</TableHead>
                    <TableHead className="text-right">{t("impressions") || "Impressions"}</TableHead>
                    <TableHead className="text-right">{t("clicks") || "Clicks"}</TableHead>
                    <TableHead className="text-right">{t("ctr") || "CTR"}</TableHead>
                    <TableHead>{t("createdAt") || "Created"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((item, index) => {
                    const ctr = item.impressions > 0 
                      ? ((item.clicks / item.impressions) * 100).toFixed(2) 
                      : 0;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">#{item.paid_ad_id}</TableCell>
                        <TableCell>#{item.admin_id}</TableCell>
                        <TableCell className="text-right">{format(item.impressions)}</TableCell>
                        <TableCell className="text-right">{format(item.clicks)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            ctr > 2 ? 'text-green-600' : ctr > 1 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {ctr}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t("noAdsYet") || "No ads tracked yet"}</p>
              <p className="text-sm mt-2">
                {t("noAdsDesc") || "Your paid ad analytics will appear here once tracking begins"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
