"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOverviewTab from "./overview-tab";
import MerchantsTab from "./merchants-tab";
import AnalyticsTab from "./analytics-tab";

export default function AgentDashboardContainer() {
  const t = useTranslations("agentDashboard");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("page.title")}</h1>
        <p className="text-muted-foreground">
          {t("page.description")}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="overview"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="merchants">{t("tabs.merchants")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("tabs.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <AdminOverviewTab />
        </TabsContent>

        <TabsContent value="merchants" className="mt-6">
          <MerchantsTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
