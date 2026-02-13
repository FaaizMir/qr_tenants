import MasterAdminOverviewTab from "./overview-tab";

export default function MasterAdminDashboardContainer() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Master Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Overview of platform performance and metrics</p>
            </div>

            <MasterAdminOverviewTab />
        </div>
    );
}
