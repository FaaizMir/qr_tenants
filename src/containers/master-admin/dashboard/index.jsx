"use client";

import { PageTabs } from "@/components/common/page-tabs";
import { getDashboardTabs } from "./dashboard-tabs";
import { useTranslations } from "next-intl";
import { getKpiData, getRecentActivities } from "./dashboard-data";

export default function MasterAdminDashboardContainer() {
    const tMasterAdminDashboard = useTranslations("dashboard.masterAdminDashboard");

    const kpiData = getKpiData(tMasterAdminDashboard);
    const recentActivities = getRecentActivities(tMasterAdminDashboard);

    const tabs = getDashboardTabs({
        kpiData,
        recentActivities,
        tMasterAdminDashboard,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    {tMasterAdminDashboard("masteradmindashboard")}
                </h1>
                <p className="text-muted-foreground">{tMasterAdminDashboard("descrption")}</p>
            </div>

            <PageTabs tabs={tabs} defaultTab="overview" />
        </div>
    );
}
