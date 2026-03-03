import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDetailContainer from "@/containers/master-admin/agents/details";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAgentDetailsPage({ params }) {
  const { id } = await params;
  const t = await getTranslations("masterAdminAgents.breadcrumb");

  const breadcrumbData = [
    { name: t("agents"), url: "/master-admin/agents" },
    { name: t("agentDetails"), url: `/master-admin/agents/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDetailContainer agentId={id} />
    </>
  );
}
