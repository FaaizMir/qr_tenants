import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAgentsPage() {
    const breadcrumbData = [
        { name: "Agents", url: "/master-admin/agents" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminAgentsContainer />
        </>
    );
}
