"use client";

import { useSearchParams } from "next/navigation";
import { TrendingUp, Star, Calendar, Download, Filter } from "lucide-react";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import LineChart from "@/components/common/charts/line-chart";
import BarChart from "@/components/common/charts/bar-chart";
import HorizontalBarChart from "@/components/common/charts/horizontal-bar-chart";
import { KpiCard } from "@/components/common/kpi-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { metrics, redemptionTrend } from "./analytics-data";

export default function MerchantAnalyticsContainer({ embedded = false }) {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batch");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {!embedded ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              {batchId
                ? `Performance metrics for Batch #${batchId}`
                : "Detailed insights into your store performance"}
            </p>
          </div>
        ) : (
          <div>
            {/* Empty div to maintain justify-between layout if embedded needs controls on right */}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[170px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <KpiCard
            key={index}
            {...metric}
            // Using default premium styling from component
          />
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Trend Chart - Takes up more space */}
        <div className="md:col-span-4 lg:col-span-5">
          <ChartWrapper
            title="Redemption Trends"
            actions={
              <div className="flex gap-2">
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% vs last period
                </span>
              </div>
            }
          >
            <div className="h-[350px] w-full pt-4">
              <LineChart data={redemptionTrend} color="#06b6d4" height={350} />
            </div>
          </ChartWrapper>
        </div>

        {/* Distribution Chart - Side Panel */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <ChartWrapper title="Rating Distribution">
            <div className="h-[250px] p-2 flex items-center justify-center">
              <BarChart
                data={[70, 20, 5, 2, 3]}
                labels={["5★", "4★", "3★", "2★", "1★"]}
                colors={["#16a34a", "#059669", "#f97316", "#f43f5e", "#6b21a8"]}
                horizontal={false}
              />
            </div>
          </ChartWrapper>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper title="Top Performing Campaigns">
          <div className="p-4 h-[300px]">
            <HorizontalBarChart
              items={[
                { label: "Summer Sale 2024", value: 85, color: "#3b82f6" },
                { label: "New User Welcome", value: 60, color: "#8b5cf6" },
                { label: "Holiday Special", value: 48, color: "#f43f5e" },
                { label: "Flash Deal", value: 32, color: "#f59e0b" },
              ]}
            />
          </div>
        </ChartWrapper>

        {/* Additional Insights or Placeholder */}
        <ChartWrapper title="Traffic Source">
          <div className="h-[300px] flex items-center justify-center flex-col gap-4 text-center p-6">
            <div className="relative w-40 h-40 rounded-full border-12 border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <span className="text-2xl font-bold">85%</span>
            </div>
            <div>
              <p className="font-medium text-sm">Direct QR Scans</p>
              <p className="text-xs text-muted-foreground">
                Most users find you via physical QR codes
              </p>
            </div>
          </div>
        </ChartWrapper>
      </div>
    </div>
  );
}
