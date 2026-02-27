import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentEarningsContainer from "@/containers/agent/earnings";
import { getTranslations } from "next-intl/server";

export default async function AgentEarningsPage() {
  const t = await getTranslations("agentEarnings.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("dashboard"), url: "/agent/dashboard" },
    { name: t("earnings"), url: "/agent/earnings" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentEarningsContainer />
    </>
  );
}
