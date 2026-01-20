import MasterAdminOverviewTab from "./overview-tab";
import { useTranslations } from "next-intl";

export default function MasterAdminDashboardContainer() {
    const tMasterAdminDashboard = useTranslations("dashboard.masterAdminDashboard");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    {tMasterAdminDashboard("masteradmindashboard")}
                </h1>
                <p className="text-muted-foreground">{tMasterAdminDashboard("descrption")}</p>
            </div>

            <MasterAdminOverviewTab />
        </div>
    );
}
