import MerchantCouponDetailContainer from "@/containers/merchant/coupons/detail";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function CouponBatchDetailPage({ params }) {
    const breadcrumbData = [
        { name: "Merchant Dashboard", url: "/merchant/dashboard" },
        { name: "Coupon Batches", url: "/merchant/coupons" },
        { name: "Detail", url: "#" }, // Name will be dynamic in container, but for breadcrumb in page we can use static or pass it
    ];

    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <MerchantCouponDetailContainer params={params} />
        </div>
    );
}
