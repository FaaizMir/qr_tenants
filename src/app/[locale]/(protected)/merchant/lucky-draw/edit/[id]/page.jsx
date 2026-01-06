import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PrizeForm from "@/containers/merchant/lucky-draw/prize-form";

export default function EditPrizePage({ params }) {
    const breadcrumbData = [
        { name: "Merchant Dashboard", url: "/merchant/dashboard" },
        { name: "Lucky Draw", url: "/merchant/lucky-draw" },
        { name: "Edit Prize", url: `/merchant/lucky-draw/edit/${params.id}` },
    ];

    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <PrizeForm isEdit={true} />
        </>
    );
}
