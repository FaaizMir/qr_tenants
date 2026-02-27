import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantDetailContainer from "@/containers/agent/merchants/detail";
import { getTranslations } from "next-intl/server";

export default async function MerchantDetailPage({ params }) {
    const { id } = params;
    const t = await getTranslations("agentMerchants.breadcrumbs");

    return (
        <>
            <BreadcrumbComponent
                data={[
                    { name: t("dashboard"), url: "/agent/dashboard" },
                    { name: t("merchants"), url: "/agent/merchants" },
                    { name: t("details"), url: `/agent/merchants/${id}` }
                ]}
            />
            <MerchantDetailContainer params={params} />
        </>
    );
}
