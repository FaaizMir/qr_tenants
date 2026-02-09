import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";

export default async function MasterAdminAgentsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Agents", url: "/master-admin/agents" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminAgentsContainer />
    </>
  );
}
