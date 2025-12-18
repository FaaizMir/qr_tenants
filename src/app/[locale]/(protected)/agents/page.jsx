import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentsTable from "@/containers/agents/agents-table";
import { getTranslations } from "next-intl/server";

export default async function AgentsPage({ params }) {
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("home"), url: "/dashboard" },
    { name: "Agents", url: "/agents" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentsTable />
    </>
  );
}

