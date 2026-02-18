import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { PlatformSettingsForm } from "@/containers/master-admin/settings/platform-settings-form";

export default function SuperAdminSettings() {
    const breadcrumbData = [
        { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
        { name: "Platform Settings", url: "/master-admin/superadmin_settings" },
    ];
    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <div className="px-4 pb-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Platform Configuration</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage subscription fees, platform costs, and currency settings
                    </p>
                </div>
                <PlatformSettingsForm />
            </div>
        </div>
    );
}
