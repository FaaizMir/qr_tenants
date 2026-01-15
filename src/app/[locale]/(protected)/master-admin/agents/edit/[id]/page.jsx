import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { AgentForm } from "@/containers/master-admin/agents/create/agent-form";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAgentsPage({ params }) {
  const { id } = await params;
  const breadcrumbData = [
    { name: "Agents", url: "/master-admin/agents" },
    { name: "Edit Agent", url: `/master-admin/agents/edit/${id}` },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentForm isEdit={true} agentId={id} />
    </>
  );
}
