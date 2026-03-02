import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import EditMerchantContainer from "@/containers/agent/merchants/edit";
import { getTranslations } from "next-intl/server";

export default async function EditMerchantPage({ params }) {
    const resolvedParams = await params;
    const merchantId = resolvedParams.id;
    const t = await getTranslations("agentMerchants.breadcrumbs");

    const breadcrumbData = [
        { name: t("dashboard"), url: "/agent/dashboard" },
        { name: t("merchants"), url: "/agent/merchants" },
        { name: t("editMerchant"), url: `/agent/merchants/edit/${merchantId}` },
    ];

    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <EditMerchantContainer merchantId={merchantId} />
        </>
    );
}
