"use client";

import { Ticket, Users, CreditCard, Star, MessageSquare } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card";
import { PageTabs } from "@/components/common/page-tabs";
import { SubscriptionBadge } from "@/components/common/subscription-badge";
import { CreditDisplay } from "@/components/common/credit-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSubscriptionType } from "@/lib/auth-utils";

// Components for tabs
// Note: We import the containers directly here to avoid circular dependencies or double wrapping
import MerchantCouponsListingContainer from "@/containers/merchant/coupons/listing";
import MerchantWalletContainer from "@/containers/merchant/wallet";
import MerchantAnalyticsContainer from "@/containers/merchant/analytics";

export default function MerchantDashboardContainer() {
  const subscriptionType = getSubscriptionType();
  const credits = 2500;

  // Dummy KPI data
  const kpiData = [
    {
      title: "Total Coupons Issued",
      value: "1,250",
      icon: Ticket,
      trend: "up",
      trendValue: "+8.5%",
    },
    {
      title: "Total Redeemed",
      value: "856",
      icon: Users,
      trend: "up",
      trendValue: "+12%",
    },
    {
      title: "Average Rating",
      value: "4.8",
      icon: Star,
      trend: "up",
      trendValue: "+0.2",
    },
    {
      title: "Remaining Credits",
      value: credits.toLocaleString(),
      icon: CreditCard,
    },
  ];

  const recentRedemptions = [
    {
      id: 1,
      code: "SUMMER20-X8Y9",
      customer: "John Doe",
      time: "10 mins ago",
      amount: "$5.00",
    },
    {
      id: 2,
      code: "WELCOME-A1B2",
      customer: "Jane Smith",
      time: "45 mins ago",
      amount: "$10.00",
    },
    {
      id: 3,
      code: "SUMMER20-C3D4",
      customer: "Mike Johnson",
      time: "1 hour ago",
      amount: "$5.00",
    },
  ];

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {kpiData.map((kpi, index) => (
              <KpiCard key={index} {...kpi} />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Redemptions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Redemptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRedemptions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.code}</p>
                          <p className="text-sm text-muted-foreground">
                            Redeemed by {item.customer}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          Saved {item.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Automation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Automation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>WhatsApp Nudges</span>
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Birthday Rewards</span>
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Review Requests</span>
                  <span className="flex h-2 w-2 rounded-full bg-gray-300" />
                </div>
                <div className="pt-4">
                  <Link href="/en/merchant/campaigns">
                    <Button variant="outline" className="w-full">
                      Manage Automations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrated Analytics */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold italic text-gray-700">
                Analytics Overview
              </h2>
            </div>
            <MerchantAnalyticsContainer embedded={true} />
          </div>
        </div>
      ),
    },
    {
      value: "coupons",
      label: "Coupon Batches",
      content: <MerchantCouponsListingContainer embedded={true} />,
    },
    {
      value: "wallet",
      label: "Wallet",
      content: <MerchantWalletContainer embedded={true} />,
    },
    {
      value: "settings",
      label: "Settings",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings content coming soon...
            </p>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <SubscriptionBadge type={subscriptionType} />
            <span className="text-muted-foreground">•</span>
            <CreditDisplay credits={credits} />
          </div>
        </div>
        <Link href="/en/merchant/coupons/create">
          <Button>Create New Batch</Button>
        </Link>
      </div>

      <PageTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
