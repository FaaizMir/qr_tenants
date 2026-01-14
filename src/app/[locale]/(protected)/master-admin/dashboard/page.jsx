import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminDashboardContainer from "@/containers/master-admin/dashboard";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminDashboardPage() {
    const tMasterAdminDashboard = await getTranslations("dashboard.masterAdminDashboard");
    const breadcrumbData = [
        { name: tMasterAdminDashboard("masteradmindashboard"), url: "/master-admin/dashboard" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminDashboardContainer />
        </>
    );
}
