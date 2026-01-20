"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import {
    Calendar as CalendarIcon,
    Users,
    Store,
    Wallet,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// --- Native Date Helpers ---
const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const formatDisplayDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function AdminOverviewTab() {
    const { data: session } = useSession();
    const adminId = session?.adminId;

    // Date State
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });
    const [filterType, setFilterType] = useState("this_month");

    // Data State
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handlePresetChange = (val) => {
        setFilterType(val);
        const now = new Date();
        let from = new Date();
        let to = new Date();

        switch (val) {
            case "today": from = now; to = now; break;
            case "yesterday":
                from = new Date(now); from.setDate(from.getDate() - 1);
                to = new Date(from); break;
            case "last_7_days":
                from = new Date(now); from.setDate(from.getDate() - 7); break;
            case "last_30_days":
                from = new Date(now); from.setDate(from.getDate() - 30); break;
            case "this_month":
                from = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case "last_month":
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0); break;
            default: return;
        }
        setDateRange({ from, to });
    };

    useEffect(() => {
        if (!adminId || !dateRange.from || !dateRange.to) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const startDate = formatDate(dateRange.from);
                const endDate = formatDate(dateRange.to);
                const res = await axiosInstance.get(`/admins/${adminId}/dashboard`);
                if (res?.data?.data) setData(res.data.data);
            } catch (error) {
                console.error("Failed to fetch admin dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [adminId, dateRange]);

    if (!adminId) return null;

    if (loading && !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-full sm:w-1/3 bg-muted rounded-md" />
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-md" />)}
                </div>
                <div className="h-96 bg-muted rounded-md" />
            </div>
        );
    }

    const overview = data?.overview || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-[160px]">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    {filterType === 'custom' && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[240px] pl-3 text-left font-normal">
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>{formatDisplayDate(dateRange.from)} - {formatDisplayDate(dateRange.to)}</>
                                        ) : (formatDisplayDate(dateRange.from))
                                    ) : (<span>Pick a date</span>)}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <OverviewCard label="Total Revenue" value={`$${overview.totalRevenue?.toLocaleString() || 0}`} icon={Wallet} color="text-emerald-600" bg="bg-emerald-100" />
                <OverviewCard label="Total Merchants" value={overview.totalMerchants || 0} icon={Store} color="text-blue-600" bg="bg-blue-100" />
                <OverviewCard label="Active Merchants" value={overview.activeMerchants || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
                <OverviewCard label="Inactive Merchants" value={overview.inactiveMerchants || 0} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
                <OverviewCard label="Annual Merchants" value={overview.annualMerchants || 0} icon={TrendingUp} color="text-purple-600" bg="bg-purple-100" />
                <OverviewCard label="Temporary Merchants" value={overview.temporaryMerchants || 0} icon={Users} color="text-orange-600" bg="bg-orange-100" />
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Merchant Distribution</CardTitle>
                        <CardDescription>Annual vs Temporary Subscription Ratio</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-10">
                        <MerchantTypeChart
                            annual={overview.annualMerchants || 0}
                            temporary={overview.temporaryMerchants || 0}
                            total={overview.totalMerchants || 0}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function OverviewCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold mt-1">{value}</div>
            </div>
            {Icon && (
                <div className={cn("p-3 rounded-full", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
            )}
        </div>
    );
}

function MerchantTypeChart({ annual, temporary, total }) {
    if (total === 0) return <div className="text-muted-foreground py-20">No merchant data available</div>;

    const pAnnual = total > 0 ? (annual / total) * 100 : 0;
    const pTemp = total > 0 ? (temporary / total) * 100 : 0;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <div className="relative w-64 h-64 rounded-full flex items-center justify-center"
                style={{
                    background: `conic-gradient(#8b5cf6 0% ${pAnnual}%, #fb923c ${pAnnual}% ${pAnnual + pTemp}%, #e2e8f0 ${pAnnual + pTemp}% 100%)`
                }}>
                <div className="absolute w-44 h-44 bg-card rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl font-bold">{total}</span>
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Total</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-violet-500 rounded-full" />
                        <span className="text-sm font-medium">Annual</span>
                    </div>
                    <div className="text-2xl font-bold">{annual}</div>
                    <div className="text-xs text-muted-foreground">{pAnnual.toFixed(1)}%</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full" />
                        <span className="text-sm font-medium">Temporary</span>
                    </div>
                    <div className="text-2xl font-bold">{temporary}</div>
                    <div className="text-xs text-muted-foreground">{pTemp.toFixed(1)}%</div>
                </div>
            </div>
        </div>
    );
}
