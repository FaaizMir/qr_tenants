"use client";

import { useSearchParams } from "next/navigation";
import { TrendingUp, Star } from "lucide-react";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import { KpiCard } from "@/components/common/kpi-card";

import { metrics, redemptionTrend } from "./analytics-data";

export default function MerchantAnalyticsContainer({ embedded = false }) {
    const searchParams = useSearchParams();
    const batchId = searchParams.get("batch");

    return (
        <div className="space-y-6">
            {!embedded && (
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        {batchId
                            ? `Performance metrics for Batch #${batchId}`
                            : "Detailed insights into your store performance"}
                    </p>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                {metrics.map((metric, index) => (
                    <KpiCard key={index} {...metric} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <ChartWrapper title="Redemption Trends (Last 6 Months)">
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                        <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">Chart Placeholder</p>
                        <p className="text-xs mt-1">
                            Showing upward trend: {redemptionTrend.join(" → ")}
                        </p>
                    </div>
                </ChartWrapper>

                <ChartWrapper title="Review Distribution">
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                        <Star className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">Chart Placeholder</p>
                        <p className="text-xs mt-1">
                            5★: 70%, 4★: 20%, 3★: 5%, 2★: 2%, 1★: 3%
                        </p>
                    </div>
                </ChartWrapper>
            </div>

            <ChartWrapper title="Top Performing Coupons">
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                    <p className="text-sm">Table or Horizontal Bar Chart Placeholder</p>
                    <p className="text-xs mt-1">
                        Summer Sale (85% redeemed), Welcome Offer (60% redeemed)
                    </p>
                </div>
            </ChartWrapper>
        </div>
    );
}
