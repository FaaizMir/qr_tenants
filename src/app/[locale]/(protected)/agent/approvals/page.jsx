"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import React from "react";
import AgentApprovalsContainer from "@/containers/agent/agentApprovalsContainer";

export default function AgentApprovals() {
    return (
        <div className="space-y-6">
            <BreadcrumbComponent
                data={[
                    { name: "Dashboard", url: "/agent/dashboard" },
                    { name: "Approvals", url: "/agent/approvals" },
                ]}
            />
            <AgentApprovalsContainer />
        </div>
    );
}
