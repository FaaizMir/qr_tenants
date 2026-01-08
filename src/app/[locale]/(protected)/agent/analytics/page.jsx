"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentAnalyticsContainer from "@/containers/agent/analytics";

export default function AgentAnalyticsPage() {
    return (
        <div className="space-y-6">
            <BreadcrumbComponent
                data={[
                    { name: "Dashboard", url: "/agent/dashboard" },
                    { name: "Analytics", url: "/agent/analytics" },
                ]}
            />
            <AgentAnalyticsContainer />
        </div>
    );
}
