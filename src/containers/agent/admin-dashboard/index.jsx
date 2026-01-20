"use client";

import { useTranslations } from "next-intl";
import AdminOverviewTab from "./overview-tab";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AgentDashboardContainer() {
  const { data: session } = useSession();
  const router = useRouter();
  const tAgentDashboard = useTranslations("dashboard.agentDashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {tAgentDashboard("agentdashboard")}
        </h1>
        <p className="text-muted-foreground">{tAgentDashboard("descrption")}</p>
      </div>
      <AdminOverviewTab />
    </div>
  );
}
