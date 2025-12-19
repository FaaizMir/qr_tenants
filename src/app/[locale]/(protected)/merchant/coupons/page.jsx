"use client";

// Logic moved to src/containers/merchant/coupons/listing/index.jsx
import MerchantCouponsListingContainer from "@/containers/merchant/coupons/listing";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function MerchantCouponsPage({ embedded = false }) {
    const breadcrumbData = [
        { name: "Merchant Dashboard", url: "/merchant/dashboard" },
        { name: "Coupon Batches", url: "/merchant/coupons" },
    ];

    return (
        <div className="space-y-6">
            {!embedded && <BreadcrumbComponent data={breadcrumbData} />}
            <MerchantCouponsListingContainer embedded={embedded} />
        </div>
    );
}
