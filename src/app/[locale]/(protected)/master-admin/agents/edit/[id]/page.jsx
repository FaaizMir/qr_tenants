import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { AgentForm } from "@/containers/master-admin/agents/create/agent-form";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";

export default async function MasterAdminAgentsPage({ params }) {
  const { id } = await params;
  const t = await getTranslations("masterAdminAgents.breadcrumb");
  
  const breadcrumbData = [
    { name: t("agents"), url: "/master-admin/agents" },
    { name: t("editAgent"), url: `/master-admin/agents/edit/${id}` },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentForm isEdit={true} agentId={id} />
    </>
  );
}
