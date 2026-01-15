import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { AgentForm } from "@/containers/master-admin/agents/create/agent-form";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAgentsPage() {
  const breadcrumbData = [
    { name: "Agents", url: "/master-admin/agents" },
    { name: "Create Agent", url: "/master-admin/agents/create" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentForm />
    </>
  );
}
