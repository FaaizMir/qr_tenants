"use client";

// ... existing imports ...
import { useState } from "react";
import {
    Activity,
    CreditCard,
    Users,
    Settings,
    Ban,
    CheckCircle2,
    Smartphone,
    Ticket,
    Trophy,
    History,
    ShieldAlert,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock Data
const MERCHANT_DATA = {
    id: "m_123",
    businessName: "Burger King - Downtown",
    status: "active",
    plan: "Pro Business",
    type: "Annual",
    joined: "12 May 2024",
    stats: {
        couponsIssued: 1450,
        couponsRedeemed: 890,
        waMessages: 2500,
        luckyDraws: 12,
    },
    limits: {
        credits: { used: 1450, total: 2000 },
        whatsapp: { used: 2500, total: 5000 },
    }
};

export default function MerchantDetailContainer({ params }) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">

            {/* --- SECURITY & COMPLIANCE BANNER (Requirement 8) --- */}
            <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 font-semibold mb-1">Compliance Mode Active</AlertTitle>
                <AlertDescription className="text-xs opacity-90">
                    You are viewing a merchant under your agency. You <strong>cannot</strong> access customer PII outside of transaction logs or modify Admin-set pricing rules.
                </AlertDescription>
            </Alert>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{MERCHANT_DATA.businessName}</h1>
                        <Badge variant={MERCHANT_DATA.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                            {MERCHANT_DATA.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {MERCHANT_DATA.plan} Plan • {MERCHANT_DATA.type} Subscription • Member since {MERCHANT_DATA.joined}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Ban className="mr-2 h-4 w-4" /> Suspend
                    </Button>
                    <Button>
                        <Settings className="mr-2 h-4 w-4" /> Edit Configuration
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                {/* ... Tabs List ... */}
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Usage & Activity</TabsTrigger>
                    <TabsTrigger value="billing">Plan & Limits</TabsTrigger>
                    <TabsTrigger value="flows">Flows</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* ... (Existing KPI Cards) ... */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Coupons Issued</CardTitle>
                                <Ticket className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{MERCHANT_DATA.stats.couponsIssued}</div>
                                <p className="text-xs text-muted-foreground">+20% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">61%</div>
                                <p className="text-xs text-muted-foreground">{MERCHANT_DATA.stats.couponsRedeemed} redeemed total</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">WhatsApp Volume</CardTitle>
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{MERCHANT_DATA.stats.waMessages}</div>
                                <p className="text-xs text-muted-foreground">Messages sent this cycle</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lucky Draws</CardTitle>
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{MERCHANT_DATA.stats.luckyDraws}</div>
                                <p className="text-xs text-muted-foreground">Campaigns run</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Activity Stream</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4, 5].map((_, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                                    <History className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">Coupon Redeemed by Customer</p>
                                                    <p className="text-xs text-muted-foreground">PII Masked • 2 minutes ago • Branch: Main St</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Resource Usage</CardTitle>
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardDescription>Enforced by Admin Policy</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>System Credits</span>
                                        <span className="text-muted-foreground">{MERCHANT_DATA.limits.credits.used} / {MERCHANT_DATA.limits.credits.total}</span>
                                    </div>
                                    <Progress value={(MERCHANT_DATA.limits.credits.used / MERCHANT_DATA.limits.credits.total) * 100} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>WhatsApp API Limit</span>
                                        <span className="text-muted-foreground">{MERCHANT_DATA.limits.whatsapp.used} / {MERCHANT_DATA.limits.whatsapp.total}</span>
                                    </div>
                                    <Progress value={(MERCHANT_DATA.limits.whatsapp.used / MERCHANT_DATA.limits.whatsapp.total) * 100} className="bg-muted" />
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-muted-foreground italic">
                                        Note: Limits cannot be overridden by Agent. <br />Contact Admin for plan upgrades.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ... (Other Tabs Remain Similar) ... */}
                <TabsContent value="flows">
                    <Card>
                        <CardHeader>
                            <CardTitle>Review & Reward Flows</CardTitle>
                            <CardDescription>Visual flows configured by this merchant</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-8 text-center bg-muted/20 border-dashed">
                                <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Flow Visualization</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                                    This merchant has set up a standard flow: <strong>Scan QR</strong> → <strong>Review Form</strong> → <strong>Social Share</strong> → <strong>Reward Coupon</strong>.
                                </p>
                                <Button variant="outline" className="mt-6">Inspect Flow Logic</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
