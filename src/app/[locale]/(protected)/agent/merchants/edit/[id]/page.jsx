import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import EditMerchantContainer from "@/containers/agent/merchants/edit";

export default async function EditMerchantPage({ params }) {
    const resolvedParams = await params;
    const merchantId = resolvedParams.id;

    const breadcrumbData = [
        { name: "Dashboard", url: "/agent/dashboard" },
        { name: "Merchants", url: "/agent/merchants" },
        { name: "Edit Merchant", url: `/agent/merchants/edit/${merchantId}` },
    ];

    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <EditMerchantContainer merchantId={merchantId} />
        </>
    );
}
