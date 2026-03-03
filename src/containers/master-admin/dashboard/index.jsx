"use client";

import { useTranslations } from "next-intl";
import MasterAdminOverviewTab from "./overview-tab";

export default function MasterAdminDashboardContainer() {
    const t = useTranslations("masterAdminDashboard");
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    {t("title")}
                </h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            <MasterAdminOverviewTab />
        </div>
    );
}
