"use client";

import { Users, DollarSign, UserCheck } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card";
import { PageTabs } from "@/components/common/page-tabs";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function AgentDashboardContainer() {
  // Dummy data
  const kpiData = [
    {
      title: "Total Merchants",
      value: "45",
      icon: Users,
      trend: "up",
      trendValue: "+12%",
    },
    {
      title: "Total Earnings",
      value: "$12,450",
      icon: DollarSign,
      trend: "up",
      trendValue: "+8.2%",
    },
    {
      title: "Active Merchants",
      value: "38",
      icon: UserCheck,
      trend: "up",
      trendValue: "+5%",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      merchant: "Coffee House",
      action: "New subscription",
      time: "2 hours ago",
    },
    {
      id: 2,
      merchant: "Pizza Palace",
      action: "Coupon batch created",
      time: "5 hours ago",
    },
    {
      id: 3,
      merchant: "Beauty Salon",
      action: "Credits purchased",
      time: "1 day ago",
    },
    {
      id: 4,
      merchant: "Pet Store",
      action: "WhatsApp campaign activated",
      time: "2 days ago",
    },
    {
      id: 5,
      merchant: "Book Shop",
      action: "Annual subscription renewed",
      time: "3 days ago",
    },
  ];

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {kpiData.map((kpi, index) => (
              <KpiCard key={index} {...kpi} />
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Link href="/en/agent/merchants">
                <Button>Add New Merchant</Button>
              </Link>
              <Link href="/en/agent/earnings">
                <Button variant="outline">View Earnings Report</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      value: "activity",
      label: "Activity",
      content: (
        <div className="space-y-6">
          <ChartWrapper title="Monthly Activity">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will display monthly merchant activity trends
            </div>
          </ChartWrapper>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{activity.merchant}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      value: "reports",
      label: "Reports",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Monthly Earnings Report</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on June 1, 2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Merchant Activity Report</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on May 28, 2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Commission Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on May 25, 2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your overview.
        </p>
      </div>

      <PageTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
