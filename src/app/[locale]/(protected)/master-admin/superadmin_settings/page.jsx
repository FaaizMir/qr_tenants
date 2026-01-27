import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentSubscriptionFee from "@/containers/master-admin/packages/agent-subscription-fee";

export default function SuperAdminSettings() {
    const breadcrumbData = [
        { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
        { name: "Settings", url: "/master-admin/superadmin_settings" },
    ];
    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <div className="px-4">
                <AgentSubscriptionFee />
            </div>
        </div>
    );
}
