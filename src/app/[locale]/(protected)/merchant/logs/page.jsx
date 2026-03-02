import SystemLogsContainer from "@/containers/logs/system-logs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function MerchantLogsPage() {
  const session = await getServerSession(authOptions);
  const merchantId = session?.user?.merchantId;
  const t = await getTranslations("systemLogs.pages.merchant");
  
  const breadcrumbData = [
    { name: t("breadcrumb.dashboard"), url: "/merchant/dashboard" },
    { name: t("breadcrumb.logs"), url: "/merchant/logs" },
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
        <SystemLogsContainer scope="merchant" merchantId={merchantId} />
      </div>
    </>
  );
}
