import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { AgentForm } from "@/containers/master-admin/agents/create/agent-form";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";
import CreateAgentContainer from "@/containers/master-admin/agents/create";

export default async function MasterAdminAgentsPage() {
  const t = await getTranslations("masterAdminAgents.breadcrumb");
  
  const breadcrumbData = [
    { name: t("agents"), url: "/master-admin/agents" },
    { name: t("createAgent"), url: "/master-admin/agents/create" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CreateAgentContainer />
    </>
  );
}
