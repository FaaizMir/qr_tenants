import SystemLogsContainer from "@/containers/logs/system-logs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { getTranslations } from "next-intl/server";

export default async function AgentLogsPage() {
  const session = await getServerSession(authOptions);
  const agentId = session?.user?.adminId;
  const t = await getTranslations("systemLogs.pages.agent");
  
  const breadcrumbData = [
    { name: t("breadcrumb.dashboard"), url: "/agent/dashboard" },
    { name: t("breadcrumb.logs"), url: "/agent/logs" },
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
        <SystemLogsContainer scope="agent" agentId={agentId} />
      </div>
    </>
  );
}
