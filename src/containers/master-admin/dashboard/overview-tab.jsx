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
    Loader2,
    UserCheck,
    Ticket,
    MessageSquare,
    DollarSign,
    Shield, Activity
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

export default function MasterAdminOverviewTab() {
    const { data: session } = useSession();

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
        if (!dateRange.from || !dateRange.to) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const startDate = formatDate(dateRange.from);
                const endDate = formatDate(dateRange.to);
                const res = await axiosInstance.get(`/super-admins/dashboard`, {
                    params: { startDate, endDate }
                });
                if (res?.data?.data) setData(res.data.data);
            } catch (error) {
                console.error("Failed to fetch master admin dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange]);

    if (loading && !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-full sm:w-1/3 bg-muted rounded-md" />
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-md" />)}
                </div>
                <div className="h-96 bg-muted rounded-md" />
            </div>
        );
    }

    const overview = data?.overview || {};
    const revenue = data?.revenue || {};

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">System Analytics</h2>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-40">
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
                                <Button variant="outline" className="w-60 pl-3 text-left font-normal">
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

            {/* Revenue Analytics */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Financial Performance</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <OverviewCard label="Total Commissions" value={`$${(revenue.totalCommissions || 0).toLocaleString()}`} icon={Wallet} color="text-emerald-600" bg="bg-emerald-100" />
                    <OverviewCard label="Subscription Revenue" value={`$${(revenue.annualSubscriptionRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-100" />
                    <OverviewCard label="Credit Purchases" value={`$${(revenue.creditPurchaseRevenue || 0).toLocaleString()}`} icon={DollarSign} color="text-purple-600" bg="bg-purple-100" />
                    <OverviewCard label="Total Revenue" value={`$${((revenue.totalCommissions || 0) + (revenue.annualSubscriptionRevenue || 0) + (revenue.creditPurchaseRevenue || 0)).toLocaleString()}`} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
                </div>
            </div>

            {/* Overview Analytics */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">General Overview</h3>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <OverviewCard label="Total Agents" value={overview.totalAdmins || 0} icon={Shield} color="text-slate-600" bg="bg-slate-100" />
                    <OverviewCard label="Active Agents" value={overview.activeAdmins || 0} icon={UserCheck} color="text-indigo-600" bg="bg-indigo-100" />
                    <OverviewCard label="Total Merchants" value={overview.totalMerchants || 0} icon={Store} color="text-blue-600" bg="bg-blue-100" />
                    <OverviewCard label="Total Customers" value={overview.totalCustomers || 0} icon={Users} color="text-orange-600" bg="bg-orange-100" />
                    <OverviewCard label="Coupons Issued" value={overview.totalCouponsIssued || 0} icon={Ticket} color="text-amber-600" bg="bg-amber-100" />
                    <OverviewCard label="Coupons Redeemed" value={overview.totalCouponsRedeemed || 0} icon={CheckCircle} color="text-teal-600" bg="bg-teal-100" />
                    <OverviewCard label="Feedback Recieved" value={overview.totalFeedbackSubmissions || 0} icon={MessageSquare} color="text-rose-600" bg="bg-rose-100" />
                    <OverviewCard label="Active Merchants" value={overview.activeMerchants || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1 shadow-sm border-muted/60">
                    <CardHeader>
                        <CardTitle>Merchant Tier Distribution</CardTitle>
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

                {/* Dynamic Top Performers */}
                <Card className="lg:col-span-2 shadow-sm border-muted/60 overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Top Performing Merchants</CardTitle>
                                <CardDescription>Stores with highest volume and engagement</CardDescription>
                            </div>
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-muted/60">
                            {data?.topMerchants?.length > 0 ? (
                                data.topMerchants.map((merchant, idx) => (
                                    <div key={merchant.merchantId || idx} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                {merchant.businessName?.charAt(0) || "M"}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{merchant.businessName}</div>
                                                <div className="text-xs text-muted-foreground flex flex-col gap-1.5 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center gap-1">
                                                            <Ticket className="h-3 w-3 text-amber-500" />
                                                            {merchant.totalCouponsIssued || 0} Issued
                                                        </span>
                                                        <span className="text-muted/40 text-[10px]">•</span>
                                                        <span className="text-[10px] font-bold text-indigo-600">
                                                            {merchant.totalCouponsRedeemed > 0
                                                                ? ((merchant.totalCouponsRedeemed / merchant.totalCouponsIssued) * 100).toFixed(0)
                                                                : 0}% Success Rate
                                                        </span>
                                                    </div>
                                                    <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${merchant.totalCouponsIssued > 0
                                                                    ? Math.min((merchant.totalCouponsRedeemed / merchant.totalCouponsIssued) * 100, 100)
                                                                    : 0}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-indigo-600">
                                                {merchant.totalCouponsRedeemed || 0}
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Redeemed</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-muted-foreground">
                                    <Store className="mx-auto h-10 w-10 opacity-20 mb-2" />
                                    <p className="text-sm">No performance data for this period</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Insights Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm border-muted/60">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            Revenue Streams
                        </CardTitle>
                        <CardDescription>Breakdown of total platform earnings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RevenueList
                            label="Commissions"
                            amount={revenue.totalCommissions}
                            total={revenue.totalCommissions + revenue.annualSubscriptionRevenue + revenue.creditPurchaseRevenue}
                            color="bg-emerald-500"
                        />
                        <RevenueList
                            label="Subscriptions"
                            amount={revenue.annualSubscriptionRevenue}
                            total={revenue.totalCommissions + revenue.annualSubscriptionRevenue + revenue.creditPurchaseRevenue}
                            color="bg-blue-500"
                        />
                        <RevenueList
                            label="Credit Sales"
                            amount={revenue.creditPurchaseRevenue}
                            total={revenue.totalCommissions + revenue.annualSubscriptionRevenue + revenue.creditPurchaseRevenue}
                            color="bg-purple-500"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-muted/60">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-500" />
                            Global Engagement
                        </CardTitle>
                        <CardDescription>Interaction metrics across all stores</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 py-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{overview.totalFeedbackSubmissions || 0}</div>
                                <div className="text-[10px] font-bold uppercase text-muted-foreground">Total Feedback</div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="text-2xl font-bold">
                                    {overview.totalCouponsIssued > 0
                                        ? ((overview.totalCouponsRedeemed / overview.totalCouponsIssued) * 100).toFixed(1)
                                        : 0}%
                                </div>
                                <div className="text-[10px] font-bold uppercase text-muted-foreground">Redemption Rate</div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                <span>Platform Activity Pulse</span>
                                <span className="text-emerald-500">Normal System Load</span>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={cn("flex-1 h-3 rounded-sm animate-pulse", i % 3 === 0 ? "bg-indigo-200" : "bg-indigo-50")} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-muted/60 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                            <TrendingUp className="h-4 w-4" />
                            Growth Highlights
                        </CardTitle>
                        <CardDescription>Latest platform expansion data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-white rounded-lg border border-primary/10 shadow-sm">
                            <div className="text-xs text-muted-foreground font-semibold">New Stores This Period</div>
                            <div className="text-xl font-bold text-primary">+{data?.growth?.monthlyMerchants?.[0]?.newMerchants || 0} Merchants</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-primary/10 shadow-sm">
                            <div className="text-xs text-muted-foreground font-semibold">New Customer Registrations</div>
                            <div className="text-xl font-bold text-emerald-600">+{data?.growth?.monthlyCustomers?.[0]?.newCustomers || 0} Customers</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function RevenueList({ label, amount, total, color }) {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground truncate">{label}</span>
                <span className="font-bold">${amount?.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function OverviewCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
            {Icon && (
                <div className={cn("p-3 rounded-2xl", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
            )}
        </div>
    );
}

function MerchantTypeChart({ annual, temporary, total }) {
    if (total === 0) return <div className="text-muted-foreground py-20 flex flex-col items-center gap-2">
        <Store className="h-10 w-10 opacity-20" />
        <p>No merchant data available</p>
    </div>;

    const pAnnual = total > 0 ? (annual / total) * 100 : 0;
    const pTemp = total > 0 ? (temporary / total) * 100 : 0;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
                style={{
                    background: `conic-gradient(#6366f1 0% ${pAnnual}%, #f97316 ${pAnnual}% ${pAnnual + pTemp}%, #e2e8f0 ${pAnnual + pTemp}% 100%)`
                }}>
                <div className="absolute w-32 h-32 bg-card rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-bold">{total}</span>
                    <span className="text-xs font-medium text-muted-foreground">Total Stores</span>
                </div>
            </div>

            <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-[10px] font-semibold uppercase">Annual</span>
                    </div>
                    <div className="text-lg font-bold">{annual}</div>
                    <div className="text-xs text-muted-foreground">{pAnnual.toFixed(0)}%</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-[10px] font-semibold uppercase">Temp</span>
                    </div>
                    <div className="text-lg font-bold">{temporary}</div>
                    <div className="text-xs text-muted-foreground">{pTemp.toFixed(0)}%</div>
                </div>
            </div>
        </div>
    );
}
