"use client";

import { useSearchParams } from "next/navigation";
import { TrendingUp, Star } from "lucide-react";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import LineChart from "@/components/common/charts/line-chart";
import BarChart from "@/components/common/charts/bar-chart";
import HorizontalBarChart from "@/components/common/charts/horizontal-bar-chart";
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
                <div className="md:col-span-2">
                    <ChartWrapper title="Redemption Trends (Last 6 Months)">
                        <div className="h-[340px]">
                            <LineChart data={redemptionTrend} color="#06b6d4" height={340} />
                        </div>
                    </ChartWrapper>
                </div>

                <div>
                    <ChartWrapper title="Review Distribution">
                        <div className="h-[300px] p-4 flex items-center">
                            <BarChart
                                data={[70, 20, 5, 2, 3]}
                                labels={["5★", "4★", "3★", "2★", "1★"]}
                                colors={["#16a34a", "#059669", "#f97316", "#f43f5e", "#6b21a8"]}
                            />
                        </div>
                    </ChartWrapper>
                </div>

                <div>
                    <ChartWrapper title="Top Performing Coupons">
                        <div className="p-4 h-[300px]" >
                            <HorizontalBarChart
                                items={[
                                    { label: "Summer Sale", value: 85 },
                                    { label: "Welcome Offer", value: 60 },
                                    { label: "Holiday Promo", value: 48 },
                                ]}
                                color="#06b6d4"
                            />
                        </div>
                    </ChartWrapper>
                </div>
            </div>
        </div>
    );
}
