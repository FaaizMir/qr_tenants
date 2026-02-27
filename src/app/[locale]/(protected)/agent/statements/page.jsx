import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentStatements from "@/containers/agent/statements";
import { getTranslations } from "next-intl/server";

export default async function AgentStatementsPage() {
  const t = await getTranslations("agentStatements");
  
  const breadcrumbData = [
    { name: t("breadcrumbs.dashboard"), url: "/agent/dashboard" },
    { name: t("breadcrumbs.statements"), url: "/agent/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentStatements />
    </>
  );
}
