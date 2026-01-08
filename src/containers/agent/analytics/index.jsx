"use client";

import { useState } from "react";
import {
    Download,
    Filter,
    Users,
    Ticket,
    MessageCircle,
    Trophy,
    TrendingUp,
    Calendar,
    MapPin,
    Store,
    PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";

import { analyticsStats, growthTrends, merchantPerformance } from "./analytics-data";

// Simple CSS Bar Chart Component
const SimpleBarChart = ({ data, dataKey, color = "bg-primary", height = 200 }) => {
    const maxVal = Math.max(...data.map(d => d[dataKey]));
    return (
        <div className="flex items-end justify-between gap-2 w-full" style={{ height: `${height}px` }}>
            {data.map((item, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="w-full relative flex items-end justify-center h-full">
                        <div
                            className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${color} opacity-80 group-hover:opacity-100`}
                            style={{ height: `${(item[dataKey] / maxVal) * 100}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-sm border">
                                {item[dataKey]}
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                </div>
            ))}
        </div>
    );
};

// Simple CSS Line Chart Approximation (Blocks)
const SimpleMetricCard = ({ title, value, subtext, icon: Icon, trend }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && <span className="text-xs text-emerald-600 font-medium">{trend}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </CardContent>
    </Card>
);

export default function AgentAnalyticsContainer() {
    const [timeRange, setTimeRange] = useState("6m");
    const [region, setRegion] = useState("all");

    // Columns for the detailed table
    const columns = [
        {
            accessorKey: "name",
            header: "Merchant Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            )
        },
        {
            accessorKey: "region",
            header: "Region",
        },
        {
            accessorKey: "coupons",
            header: "Coupons Issued",
            cell: ({ row }) => row.original.coupons.toLocaleString()
        },
        {
            accessorKey: "redeemed",
            header: "Redeemed",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span>{row.original.redeemed.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">({Math.round((row.original.redeemed / row.original.coupons) * 100)}%)</span>
                </div>
            )
        },
        {
            accessorKey: "waSent",
            header: "WA Messages",
            cell: ({ row }) => row.original.waSent.toLocaleString()
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {row.original.status}
                </Badge>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
                    <p className="text-muted-foreground">Performance metrics and growth insights.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="bg-muted/30 border-none shadow-none">
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px] h-9">
                            <Calendar className="mr-2 h-3.5 w-3.5" />
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="w-[150px] h-9">
                            <MapPin className="mr-2 h-3.5 w-3.5" />
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="downtown">Downtown</SelectItem>
                            <SelectItem value="westside">Westside</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select>
                        <SelectTrigger className="w-[180px] h-9">
                            <Store className="mr-2 h-3.5 w-3.5" />
                            <SelectValue placeholder="All Merchants" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Merchants</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SimpleMetricCard
                    title="Total Merchants"
                    value={analyticsStats.totalMerchants}
                    subtext={`${analyticsStats.activeMerchants} Active • ${analyticsStats.inactiveMerchants} Inactive`}
                    icon={Users}
                />
                <SimpleMetricCard
                    title="Total Revenue"
                    value={`$${analyticsStats.totalRevenue.toLocaleString()}`}
                    subtext="Gross earnings YTD"
                    trend={analyticsStats.revenueGrowth}
                    icon={TrendingUp}
                />
                <SimpleMetricCard
                    title="Coupons Issued"
                    value={analyticsStats.totalCoupons.toLocaleString()}
                    subtext={`${analyticsStats.redeemedCoupons.toLocaleString()} Redeemed`}
                    icon={Ticket}
                />
                <SimpleMetricCard
                    title="WhatsApp Volume"
                    value={analyticsStats.waMessages.toLocaleString()}
                    subtext="Messages delivered"
                    icon={MessageCircle}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Growth</CardTitle>
                        <CardDescription>Monthly revenue trends over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={growthTrends} dataKey="revenue" color="bg-emerald-500" height={250} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Merchant Acquisition vs WA Usage</CardTitle>
                        <CardDescription>Comparing new merchants growth with messaging volume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Multi-metric visualization (simulated) */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium flex items-center gap-2"><Users className="h-3 w-3" /> Merchant Growth</span>
                                </div>
                                <SimpleBarChart data={growthTrends} dataKey="merchants" color="bg-blue-500" height={80} />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium flex items-center gap-2"><MessageCircle className="h-3 w-3" /> WhatsApp Volume</span>
                                </div>
                                <SimpleBarChart data={growthTrends} dataKey="wa" color="bg-indigo-500" height={80} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Merchant Performance Report</CardTitle>
                            <CardDescription>Detailed breakdown by merchant for the selected period.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={merchantPerformance}
                        columns={columns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
