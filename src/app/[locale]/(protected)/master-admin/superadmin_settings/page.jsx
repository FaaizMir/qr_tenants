import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { PlatformSettingsForm } from "@/containers/master-admin/settings/platform-settings-form";
import { getTranslations } from "next-intl/server";

export default async function SuperAdminSettings() {
    const t = await getTranslations("masterAdminSettings");
    
    const breadcrumbData = [
        { name: t("breadcrumbs.masterAdminDashboard"), url: "/master-admin/dashboard" },
        { name: t("breadcrumbs.platformSettings"), url: "/master-admin/superadmin_settings" },
    ];
    
    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <div className="px-4 pb-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">{t("header.title")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t("header.subtitle")}
                    </p>
                </div>
                <PlatformSettingsForm />
            </div>
        </div>
    );
}
