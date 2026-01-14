import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminMerchantsContainer from "@/containers/master-admin/merchants";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminMerchantsPage() {
    const breadcrumbData = [
        { name: "Merchants", url: "/master-admin/merchants" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminMerchantsContainer />
        </>
    );
}
