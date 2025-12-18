import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentForm from "@/containers/agents/agent-form";
import { getTranslations } from "next-intl/server";

export default async function CreateAgentPage() {
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("home"), url: "/dashboard" },
    { name: "Agents", url: "/agents" },
    { name: "Create Agent", url: "/agents/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentForm isEdit={false} />
    </>
  );
}

