"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
    Shield,
    Activity,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const t = useTranslations("masterAdminDashboard");
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

    // Pagination State for Top Merchants
    const [merchantsPage, setMerchantsPage] = useState(0);
    const merchantsPerPage = 10;

    const handlePresetChange = (val) => {
        setFilterType(val);
        setMerchantsPage(0); // Reset pagination when filter changes
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
                    // params: { startDate, endDate }
                });
                if (res?.data?.data) setData(res.data.data);
            } catch (error) {
                console.error(t("messages.fetchError"), error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange, t]);

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
    const staffRole = session?.user?.staffRole || "Super Admin";

    // Pagination logic for top merchants
    const topMerchants = data?.topMerchants || [];
    const totalMerchants = topMerchants.length;
    const totalMerchantsPages = Math.ceil(totalMerchants / merchantsPerPage);
    const paginatedMerchants = topMerchants.slice(
        merchantsPage * merchantsPerPage,
        (merchantsPage + 1) * merchantsPerPage
    );

    // Role-based visibility flags
    const isSuperAdmin = staffRole === "Super Admin";
    const canSeeFinance = isSuperAdmin || staffRole === "Finance Viewer";
    const canSeeUsers = isSuperAdmin;
    const canSeeFeedback = isSuperAdmin || staffRole === "Support Staff";
    const canSeeApprovals = isSuperAdmin || staffRole === "Ad Approver";

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">
                        {isSuperAdmin ? t("sections.systemAnalytics") : t("sections.roleDashboard", { role: staffRole })}
                    </h2>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-40">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t("filters.selectRange")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">{t("filters.today")}</SelectItem>
                            <SelectItem value="yesterday">{t("filters.yesterday")}</SelectItem>
                            <SelectItem value="this_month">{t("filters.thisMonth")}</SelectItem>
                            <SelectItem value="last_month">{t("filters.lastMonth")}</SelectItem>
                            <SelectItem value="last_7_days">{t("filters.last7Days")}</SelectItem>
                            <SelectItem value="last_30_days">{t("filters.last30Days")}</SelectItem>
                            <SelectItem value="custom">{t("filters.customRange")}</SelectItem>
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
                                    ) : (<span>{t("filters.pickDate")}</span>)}
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

            {/* Financial Performance Section */}
            {canSeeFinance && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("sections.financialPerformance")}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <OverviewCard label={t("financialCards.agentSubscriptions")} value={`$${(revenue.agentSubscriptionRevenue || 0).toLocaleString()}`} icon={Shield} color="text-cyan-600" bg="bg-cyan-100" />
                        <OverviewCard label={t("financialCards.merchantSubscriptions")} value={`$${(revenue.annualSubscriptionRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-100" />
                        <OverviewCard label={t("financialCards.packageCommissions")} value={`$${(revenue.creditPurchaseRevenue || 0).toLocaleString()}`} icon={DollarSign} color="text-purple-600" bg="bg-purple-100" />
                        <OverviewCard label={t("financialCards.totalPlatformRevenue")} value={`$${(revenue.totalCommissions || 0).toLocaleString()}`} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
                    </div>
                </div>
            )}

            {/* General Overview Section */}
            {(canSeeUsers || canSeeFeedback || canSeeApprovals) && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("sections.generalOverview")}</h3>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {canSeeUsers && (
                            <>
                                <OverviewCard label={t("overviewCards.totalAgents")} value={overview.totalAdmins || 0} icon={Shield} color="text-slate-600" bg="bg-slate-50/50" />
                                <OverviewCard label={t("overviewCards.activeAgents")} value={overview.activeAdmins || 0} icon={UserCheck} color="text-indigo-600" bg="bg-indigo-50/50" />
                                <OverviewCard label={t("overviewCards.totalMerchants")} value={overview.totalMerchants || 0} icon={Store} color="text-blue-600" bg="bg-blue-50/50" />
                                <OverviewCard label={t("overviewCards.totalCustomers")} value={overview.totalCustomers || 0} icon={Users} color="text-orange-600" bg="bg-orange-50/50" />
                            </>
                        )}
                        {canSeeApprovals && (
                            <>
                                <OverviewCard label={t("overviewCards.couponsIssued")} value={overview.totalCouponsIssued || 0} icon={Ticket} color="text-amber-600" bg="bg-amber-50/50" />
                                <OverviewCard label={t("overviewCards.couponsRedeemed")} value={overview.totalCouponsRedeemed || 0} icon={CheckCircle} color="text-teal-600" bg="bg-teal-50/50" />
                            </>
                        )}
                        {canSeeFeedback && (
                            <OverviewCard label={t("overviewCards.feedbackReceived")} value={overview.totalFeedbackSubmissions || 0} icon={MessageSquare} color="text-rose-600" bg="bg-rose-50/50" />
                        )}
                        {canSeeUsers && (
                            <OverviewCard label={t("overviewCards.activeMerchants")} value={overview.activeMerchants || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-50/50" />
                        )}
                    </div>
                </div>
            )}

            {isSuperAdmin && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                            <CardTitle>{t("merchantTier.title")}</CardTitle>
                            <CardDescription>{t("merchantTier.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-10">
                            <MerchantTypeChart
                                annual={overview.annualMerchants || 0}
                                temporary={overview.temporaryMerchants || 0}
                                total={overview.totalMerchants || 0}
                                t={t}
                            />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">{t("topMerchants.title")}</CardTitle>
                                    <CardDescription>{t("topMerchants.description", { total: totalMerchants })}</CardDescription>
                                </div>
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                <div className="divide-y divide-muted/60">
                                    {paginatedMerchants.length > 0 ? (
                                        paginatedMerchants.map((merchant, idx) => (
                                            <div key={merchant.merchantId || idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
                                                                    {merchant.totalCouponsIssued || 0} {t("topMerchants.issued")}
                                                                </span>
                                                                <span className="text-muted/40 text-[10px]">•</span>
                                                                <span className="text-[10px] font-bold text-indigo-600">
                                                                    {t("topMerchants.successRate", { 
                                                                        rate: merchant.totalCouponsRedeemed > 0
                                                                            ? ((merchant.totalCouponsRedeemed / merchant.totalCouponsIssued) * 100).toFixed(0)
                                                                            : 0
                                                                    })}
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
                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">{t("topMerchants.redeemed")}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground">
                                            <Store className="mx-auto h-10 w-10 opacity-20 mb-2" />
                                            <p className="text-sm">{t("topMerchants.noData")}</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            {totalMerchantsPages > 1 && (
                                <div className="flex items-center justify-between border-t p-4 bg-muted/5">
                                    <div className="text-sm text-muted-foreground">
                                        {t("topMerchants.showing", { 
                                            from: merchantsPage * merchantsPerPage + 1,
                                            to: Math.min((merchantsPage + 1) * merchantsPerPage, totalMerchants),
                                            total: totalMerchants
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMerchantsPage(prev => Math.max(0, prev - 1))}
                                            disabled={merchantsPage === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="text-sm font-medium">
                                            {t("topMerchants.page", { current: merchantsPage + 1, total: totalMerchantsPages })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setMerchantsPage(prev => Math.min(totalMerchantsPages - 1, prev + 1))}
                                            disabled={merchantsPage >= totalMerchantsPages - 1}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Additional Insights Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {canSeeFinance && (
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                {t("revenueBreakdown.title")}
                            </CardTitle>
                            <CardDescription>{t("revenueBreakdown.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RevenueList
                                label={t("revenueBreakdown.agentSubscriptions")}
                                amount={revenue.agentSubscriptionRevenue || 0}
                                total={revenue.totalCommissions}
                                color="bg-cyan-500"
                            />
                            <RevenueList
                                label={t("revenueBreakdown.merchantSubscriptions")}
                                amount={revenue.annualSubscriptionRevenue || 0}
                                total={revenue.totalCommissions}
                                color="bg-blue-500"
                            />
                            <RevenueList
                                label={t("revenueBreakdown.packageCommissions")}
                                amount={revenue.creditPurchaseRevenue || 0}
                                total={revenue.totalCommissions}
                                color="bg-purple-500"
                            />
                        </CardContent>
                    </Card>
                )}

                {canSeeFeedback && (
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-500" />
                                {t("engagement.title")}
                            </CardTitle>
                            <CardDescription>{t("engagement.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 py-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold">{overview.totalFeedbackSubmissions || 0}</div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">{t("engagement.totalFeedback")}</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-2xl font-bold">
                                        {overview.totalCouponsIssued > 0
                                            ? ((overview.totalCouponsRedeemed / overview.totalCouponsIssued) * 100).toFixed(1)
                                            : 0}%
                                    </div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">{t("engagement.redemptionRate")}</div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                    <span>{t("engagement.activityPulse")}</span>
                                    <span className="text-emerald-500">{t("engagement.systemLoad")}</span>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={cn("flex-1 h-3 rounded-sm animate-pulse", i % 3 === 0 ? "bg-indigo-200" : "bg-indigo-50")} />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isSuperAdmin && (
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                                <TrendingUp className="h-4 w-4" />
                                {t("growth.title")}
                            </CardTitle>
                            <CardDescription>{t("growth.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white rounded-lg border border-primary/10 shadow-sm">
                                <div className="text-xs text-muted-foreground font-semibold">{t("growth.newStores")}</div>
                                <div className="text-xl font-bold text-primary">{t("growth.merchants", { count: data?.growth?.monthlyMerchants?.[0]?.newMerchants || 0 })}</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-primary/10 shadow-sm">
                                <div className="text-xs text-muted-foreground font-semibold">{t("growth.newCustomers")}</div>
                                <div className="text-xl font-bold text-emerald-600">{t("growth.customers", { count: data?.growth?.monthlyCustomers?.[0]?.newCustomers || 0 })}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
        <div className="bg-card border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl p-5 flex items-center justify-between">
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

function MerchantTypeChart({ annual, temporary, total, t }) {
    if (total === 0) return <div className="text-muted-foreground py-20 flex flex-col items-center gap-2">
        <Store className="h-10 w-10 opacity-20" />
        <p>{t("merchantTier.noData")}</p>
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
                    <span className="text-xs font-medium text-muted-foreground">{t("merchantTier.totalStores")}</span>
                </div>
            </div>

            <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-[10px] font-semibold uppercase">{t("merchantTier.annual")}</span>
                    </div>
                    <div className="text-lg font-bold">{annual}</div>
                    <div className="text-xs text-muted-foreground">{pAnnual.toFixed(0)}%</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-[10px] font-semibold uppercase">{t("merchantTier.temp")}</span>
                    </div>
                    <div className="text-lg font-bold">{temporary}</div>
                    <div className="text-xs text-muted-foreground">{pTemp.toFixed(0)}%</div>
                </div>
            </div>
        </div>
    );
}
