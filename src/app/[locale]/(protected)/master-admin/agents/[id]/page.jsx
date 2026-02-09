import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDetailContainer from "@/containers/master-admin/agents/details";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAgentDetailsPage({ params }) {
  const { id } = await params;

  const breadcrumbData = [
    { name: "Agents", url: "/master-admin/agents" },
    { name: "Agent Details", url: `/master-admin/agents/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDetailContainer agentId={id} />
    </>
  );
}
