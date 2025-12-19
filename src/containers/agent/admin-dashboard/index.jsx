"use client";

import { PageTabs } from "@/components/common/page-tabs";
import { getDashboardTabs } from "./dashboard-tabs";
import { useTranslations } from "next-intl";
import { getKpiData, getRecentActivities } from "./dashboard-data";

export default function AgentDashboardContainer() {
  const tAgentDashboard = useTranslations("dashboard.agentDashboard");

  const kpiData = getKpiData(tAgentDashboard);
  const recentActivities = getRecentActivities(tAgentDashboard);

  const tabs = getDashboardTabs({
    kpiData,
    recentActivities,
    tAgentDashboard,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {tAgentDashboard("agentdashboard")}
        </h1>
        <p className="text-muted-foreground">{tAgentDashboard("descrption")}</p>
      </div>

      <PageTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
