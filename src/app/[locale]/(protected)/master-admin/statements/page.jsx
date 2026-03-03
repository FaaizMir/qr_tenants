import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import StatementsContainer from "@/containers/master-admin/statements";
import { getTranslations } from "next-intl/server";

export default async function AllStatementsPage() {
  const t = await getTranslations("masterAdminStatements.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("allStatements"), url: "/master-admin/statements" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <StatementsContainer />
    </>
  );
}
