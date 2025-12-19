"use client";

import { PageTabs } from "@/components/common/page-tabs";
import { kpiData, recentActivities } from "./dashboard-data";
import { getDashboardTabs } from "./dashboard-tabs";

export default function AgentDashboardContainer() {
  const tabs = getDashboardTabs({
    kpiData,
    recentActivities,
  });

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
