import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SystemLogsContainer from "@/containers/logs/system-logs";

export default function MasterAdminLogsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "System Logs", url: "/master-admin/logs" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            View all system activities, audit trails, and critical errors across
            the platform.
          </p>
        </div>
        <SystemLogsContainer scope="master-admin" />
      </div>
    </>
  );
}
