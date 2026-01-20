"use client";

import { PageTabs } from "@/components/common/page-tabs";
import { getDashboardTabs } from "./dashboard-tabs";
import { useTranslations } from "next-intl";
import { getKpiData, getRecentActivities } from "./dashboard-data";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AgentDashboardContainer() {
  const { data: session } = useSession();
  const router = useRouter();
  const tAgentDashboard = useTranslations("dashboard.agentDashboard");

  useEffect(() => {
    if (session?.user?.is_subscription_expired) {
      router.push("/agent/wallet");
    }
  }, [session, router]);

  const kpiData = getKpiData(tAgentDashboard);
  const recentActivities = getRecentActivities(tAgentDashboard);

  const tabs = getDashboardTabs({
    kpiData,
    recentActivities,
    tAgentDashboard,
  });

  if (session?.user?.is_subscription_expired) {
    return null;
  }

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
