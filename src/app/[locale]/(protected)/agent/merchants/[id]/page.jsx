import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantDetailContainer from "@/containers/agent/merchants/detail";

export default function MerchantDetailPage({ params }) {
    const { id } = params;

    return (
        <>
            <BreadcrumbComponent
                data={[
                    { name: "Dashboard", url: "/agent/dashboard" },
                    { name: "Merchants", url: "/agent/merchants" },
                    { name: "Details", url: `/agent/merchants/${id}` }
                ]}
            />
            <MerchantDetailContainer params={params} />
        </>
    );
}
