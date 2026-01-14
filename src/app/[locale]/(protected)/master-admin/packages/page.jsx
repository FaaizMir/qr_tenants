import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminPackagesContainer from "@/containers/master-admin/packages";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminPackagesPage() {
    const breadcrumbData = [
        { name: "Packages", url: "/master-admin/packages" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminPackagesContainer />
        </>
    );
}
