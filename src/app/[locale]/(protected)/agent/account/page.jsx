"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentAccountContainer from "@/containers/agent/account";

export default function AgentAccountPage() {
  const t = useTranslations("agentAccount.breadcrumb");
  
  const breadcrumbData = [
    { name: t("dashboard"), url: "/agent/dashboard" },
    { name: t("account"), url: "/agent/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentAccountContainer />
    </>
  );
}
