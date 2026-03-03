import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminDashboardContainer from "@/containers/master-admin/dashboard";

export default async function MasterAdminDashboardPage() {
    const t = await getTranslations("masterAdminDashboard.breadcrumb");
    
    const breadcrumbData = [
        { name: t("dashboard"), url: "/master-admin/dashboard" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminDashboardContainer />
        </>
    );
}
