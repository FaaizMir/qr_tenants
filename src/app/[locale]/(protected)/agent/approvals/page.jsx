"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import React from "react";
import AgentApprovalsContainer from "@/containers/agent/agentApprovalsContainer";

export default function AgentApprovals() {
    const t = useTranslations("agentApprovals");
    
    return (
        <div className="space-y-6">
            <BreadcrumbComponent
                data={[
                    { name: t("title"), url: "/agent/approvals" },
                ]}
            />
            <AgentApprovalsContainer />
        </div>
    );
}
