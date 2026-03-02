import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SystemLogsContainer from "@/containers/logs/system-logs";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminLogsPage() {
  const t = await getTranslations("systemLogs.pages.masterAdmin");
  
  const breadcrumbData = [
    { name: t("breadcrumb.dashboard"), url: "/master-admin/dashboard" },
    { name: t("breadcrumb.logs"), url: "/master-admin/logs" },
  ];
  
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <SystemLogsContainer scope="master-admin" />
      </div>
    </>
  );
}
