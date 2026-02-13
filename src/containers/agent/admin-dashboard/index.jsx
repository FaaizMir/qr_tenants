"use client";

import AdminOverviewTab from "./overview-tab";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AgentDashboardContainer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Agent Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of your agent performance and metrics</p>
      </div>
      <AdminOverviewTab />
    </div>
  );
}
