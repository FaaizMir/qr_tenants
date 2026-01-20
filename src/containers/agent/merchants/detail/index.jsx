"use client";

import {
    Activity,
    CreditCard,
    Users,
    Settings,
    CheckCircle2,
    Smartphone,
    Ticket,
    ShieldAlert,
    Lock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useEffect, useCallback, useState } from "react";
import {
    getMerchantById,
    getMerchantWallet,
    getMerchantTransactions,
    getCustomers,
    getCouponBatches,
    getCoupons,
} from "@/lib/services/helper";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    useRouter,
    usePathname,
    useSearchParams,
    useParams,
} from "next/navigation";

export default function MerchantDetailContainer({ params }) {
    const { id: merchantId } = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [merchant, setMerchant] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get tab from URL or default
    const activeTab = searchParams.get("tab") || "overview";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                merchantData,
                walletData,
                transactionsData,
                customersData,
                batchesData,
                couponsData,
            ] = await Promise.all([
                getMerchantById(merchantId),
                getMerchantWallet(merchantId),
                getMerchantTransactions(merchantId, { page: 1, limit: 20 }),
                getCustomers({ page: 1, pageSize: 20, isActive: true, merchantId }),
                getCouponBatches({ page: 1, pageSize: 20, merchantId }),
                getCoupons({ page: 1, pageSize: 20, merchantId }),
            ]);

            setMerchant(merchantData);
            setWallet(walletData);
            setTransactions(transactionsData?.data || []);
            setCustomers(customersData?.data || []);
            setBatches(batchesData?.data?.batches || []);
            setCoupons(couponsData?.data?.coupons || []);
        } catch (error) {
            console.error("Error fetching merchant details:", error);
            toast.error("Failed to load merchant details");
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    useEffect(() => {
        if (merchantId) {
            fetchData();
        }
    }, [fetchData, merchantId]);

    const handleTabChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                    Loading merchant details...
                </p>
            </div>
        );
    }

    if (!merchant) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Merchant not found or could not be loaded.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {merchant.business_name}
                        </h1>
                        <Badge
                            variant={merchant.user?.is_active ? "default" : "destructive"}
                            className="capitalize"
                        >
                            {merchant.user?.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className="bg-slate-50 underline-offset-4 decoration-slate-300">
                            {merchant.business_type}
                        </Badge>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                            {merchant.merchant_type} Subscription
                        </Badge>
                        <Badge variant="outline" className="text-muted-foreground font-normal border-none p-0">
                            Member since {new Date(merchant.created_at).toLocaleDateString('en-GB')}
                        </Badge>
                    </div>
                    {merchant.city && merchant.country && (
                        <p className="text-sm text-muted-foreground mt-2">
                            📍 {merchant.city}, {merchant.country}
                        </p>
                    )}
                    {merchant.qr_code_url && (
                        <div className="mt-2">
                            <a
                                href={merchant.qr_code_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                🔗 Review Page: {merchant.qr_code_url}
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/agent/merchants/edit/${merchantId}`)}
                    >
                        <Settings className="mr-2 h-4 w-4" /> Edit Configuration
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={handleTabChange}
            >
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="billing">Limits</TabsTrigger>
                </TabsList>

                {/* Overview TabContent */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">WhatsApp Credits</CardTitle>
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {wallet?.whatsapp_message_credits ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Available balance</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ad Credits</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {wallet?.paid_ad_credits ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">For promotions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Coupon Credits</CardTitle>
                                <Ticket className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {wallet?.coupon_credits ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">For batches</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {wallet?.total_credits_purchased ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{wallet?.total_credits_used ?? 0} used total</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-4 pr-4">
                                        {transactions.length > 0 ? (
                                            transactions.map((tx) => (
                                                <div key={tx.id} className="flex gap-4 items-center">
                                                    <div className={`p-2 rounded-full ${tx.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {tx.type === 'purchase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{tx.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(tx.created_at).toLocaleDateString('en-GB')}
                                                            </p>
                                                            {tx.credit_type && (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground">•</span>
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                                        {tx.credit_type}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                            {tx.status && (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground">•</span>
                                                                    <Badge
                                                                        variant={tx.status === 'completed' ? 'default' : 'secondary'}
                                                                        className="text-[10px] px-1.5 py-0 capitalize"
                                                                    >
                                                                        {tx.status}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {tx.type === 'purchase' && tx.amount ? (
                                                            <>
                                                                <p className="text-sm font-semibold text-green-600">
                                                                    +{tx.credits} credits
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    ${parseFloat(tx.amount).toFixed(2)}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {tx.credits ? `-${tx.credits}` : '0'} credits
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-muted-foreground text-sm">
                                                No transactions found.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 text-card-foreground">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle>Usage Summary</CardTitle>
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Credit Usage</span>
                                        <span className="text-muted-foreground font-mono">
                                            {wallet?.total_credits_used ?? 0} / {wallet?.total_credits_purchased ?? 0}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            wallet?.total_credits_purchased > 0
                                                ? (wallet?.total_credits_used / wallet?.total_credits_purchased) * 100
                                                : 0
                                        }
                                    />
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">WhatsApp Bal</span>
                                        </div>
                                        <span className="font-bold">{wallet?.whatsapp_message_credits ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm">Coupon Bal</span>
                                        </div>
                                        <span className="font-bold">{wallet?.coupon_credits ?? 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Activity TabContent */}
                <TabsContent value="activity" className="space-y-6 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customers ({customers.length})</CardTitle>
                                <CardDescription>Recently registered customers</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y pr-4">
                                        {customers.length > 0 ? (
                                            customers.map((c) => (
                                                <div key={c.id} className="flex items-start justify-between p-4 px-6 hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                                            {c.name?.[0]?.toUpperCase() ?? "U"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold truncate">{c.name}</p>
                                                                {c.reward && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">Reward</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{c.phone || c.email}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                                                                {c.gender && (
                                                                    <span className="capitalize">{c.gender === 'male' ? '👨' : c.gender === 'female' ? '👩' : '👤'} {c.gender}</span>
                                                                )}
                                                                {c.date_of_birth && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>🎂 {new Date(c.date_of_birth).toLocaleDateString('en-GB')}</span>
                                                                    </>
                                                                )}
                                                                <span>•</span>
                                                                <span>📅 Joined {new Date(c.created_at).toLocaleDateString('en-GB')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={c.is_active ? "outline" : "secondary"} className="shrink-0 ml-2">
                                                        {c.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 text-muted-foreground text-sm">
                                                No customers found.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Ledger</CardTitle>
                                <CardDescription>Historical credit usage</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="px-6">Description</TableHead>
                                                <TableHead className="text-right px-6">Credits</TableHead>
                                                <TableHead className="text-right px-6">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.length > 0 ? (
                                                transactions.map((tx) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-2">
                                                                {tx.type === "purchase" ? (
                                                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <ArrowDownRight className="h-3 w-3 text-slate-400" />
                                                                )}
                                                                <div>
                                                                    <p className="text-xs font-medium">{tx.description}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {new Date(tx.created_at).toLocaleDateString('en-GB')}
                                                                        </p>
                                                                        {tx.credit_type && (
                                                                            <>
                                                                                <span className="text-[10px] text-muted-foreground">•</span>
                                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">
                                                                                    {tx.credit_type}
                                                                                </Badge>
                                                                            </>
                                                                        )}
                                                                        {tx.status && (
                                                                            <>
                                                                                <span className="text-[10px] text-muted-foreground">•</span>
                                                                                <Badge
                                                                                    variant={tx.status === 'completed' ? 'default' : 'secondary'}
                                                                                    className="text-[9px] px-1 py-0"
                                                                                >
                                                                                    {tx.status}
                                                                                </Badge>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right px-6 font-semibold">
                                                            {tx.type === 'purchase' ? (
                                                                <span className="text-green-600">+{tx.credits}</span>
                                                            ) : (
                                                                <span className="text-slate-700">{tx.credits ? `-${tx.credits}` : '0'}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right px-6 font-semibold">
                                                            {tx.amount && parseFloat(tx.amount) > 0 ? (
                                                                <span className="text-green-600">${parseFloat(tx.amount).toFixed(2)}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground text-sm">
                                                        No records found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Billing/Limits TabContent */}
                <TabsContent value="billing" className="space-y-6 mt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Wallet Details</CardTitle>
                                <CardDescription>Live credit allocation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WhatsApp</p>
                                        <p className="text-3xl font-bold">{wallet?.whatsapp_message_credits ?? 0}</p>
                                        <Progress value={100} className="h-1 bg-green-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ads</p>
                                        <p className="text-3xl font-bold">{wallet?.paid_ad_credits ?? 0}</p>
                                        <Progress value={100} className="h-1 bg-blue-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coupons</p>
                                        <p className="text-3xl font-bold">{wallet?.coupon_credits ?? 0}</p>
                                        <Progress value={100} className="h-1 bg-purple-100" />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Plan</span>
                                        <span className="text-sm font-semibold capitalize">{wallet?.subscription_type}</span>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Expires</span>
                                        <span className="text-sm font-semibold">
                                            {wallet?.subscription_expires_at
                                                ? new Date(wallet.subscription_expires_at).toLocaleDateString('en-GB')
                                                : "Never"}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Currency</span>
                                        <span className="text-sm font-semibold uppercase">{wallet?.currency}</span>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Account</span>
                                        <Badge variant={wallet?.is_active ? "default" : "destructive"}>
                                            {wallet?.is_active ? "Verified" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Annual Fee</span>
                                        <Badge variant={wallet?.annual_fee_paid ? "default" : "destructive"}>
                                            {wallet?.annual_fee_paid ? "Paid" : "Unpaid"}
                                        </Badge>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg flex justify-between">
                                        <span className="text-sm text-muted-foreground">Paid Ads</span>
                                        <Badge variant={merchant?.paid_ads ? "default" : "secondary"}>
                                            {merchant?.paid_ads ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Coupon Batches ({batches.length})</CardTitle>
                                <CardDescription>Active campaigns</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="divide-y pr-4">
                                        {batches.length > 0 ? (
                                            batches.map((batch) => (
                                                <div key={batch.id} className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold">{batch.batch_name}</p>
                                                                {batch.is_active ? (
                                                                    <Badge variant="default" className="text-[9px] px-1.5 py-0">Active</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Inactive</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{batch.batch_type}</Badge>
                                                                <span className="text-[10px] text-muted-foreground font-mono">ID: {String(batch.id).substring(0, 6)}</span>
                                                                {batch.ishalal && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">Halal</Badge>
                                                                )}
                                                                {batch.visibility && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">Public</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                                                <span>📅 {new Date(batch.start_date).toLocaleDateString('en-GB')} - {new Date(batch.end_date).toLocaleDateString('en-GB')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {batch.whatsapp_enabled && (
                                                                    <span className="text-[9px] text-emerald-600">✓ WhatsApp</span>
                                                                )}
                                                                {batch.lucky_draw_enabled && (
                                                                    <span className="text-[9px] text-purple-600">✓ Lucky Draw</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-2">
                                                            <p className="text-xs font-bold">{batch.issued_quantity} / {batch.total_quantity}</p>
                                                            <p className="text-[9px] text-muted-foreground">issued</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Progress
                                                            value={(batch.issued_quantity / batch.total_quantity) * 100}
                                                            className="h-1.5"
                                                        />
                                                        <div className="flex justify-between text-[9px] text-muted-foreground">
                                                            <span>{Math.round((batch.issued_quantity / batch.total_quantity) * 100)}% consumed</span>
                                                            <span>{batch.total_quantity - batch.issued_quantity} left</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 text-muted-foreground text-sm">
                                                No batches active.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
