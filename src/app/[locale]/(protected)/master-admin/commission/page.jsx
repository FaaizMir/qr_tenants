import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminCommissionContainer from "@/containers/master-admin/commission";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminCommissionPage() {
    const breadcrumbData = [
        { name: "Commission", url: "/master-admin/commission" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminCommissionContainer />
        </>
    );
}
