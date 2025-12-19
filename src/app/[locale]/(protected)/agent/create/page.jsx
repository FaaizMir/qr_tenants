import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentForm from "@/containers/agent/agent-form";
import { getTranslations } from "next-intl/server";

export default async function CreateAgentPage() {
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/agent/dashboard" },
    { name: "Create Agent", url: "/agent/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentForm isEdit={false} />
    </>
  );
}

