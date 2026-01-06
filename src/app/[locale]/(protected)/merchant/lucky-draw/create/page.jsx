import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PrizeForm from "@/containers/merchant/lucky-draw/prize-form";

export default function CreatePrizePage() {
    const breadcrumbData = [
        { name: "Merchant Dashboard", url: "/merchant/dashboard" },
        { name: "Lucky Draw", url: "/merchant/lucky-draw" },
        { name: "Create Prize", url: "/merchant/lucky-draw/create" },
    ];

    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <PrizeForm isEdit={false} />
        </>
    );
}
