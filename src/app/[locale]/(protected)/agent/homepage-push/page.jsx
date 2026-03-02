import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentHomepagePushContainer from "@/containers/agent/homepage-push";
import { getTranslations } from "next-intl/server";

export default async function AgentHomepagePushPage() {
  const t = await getTranslations("agentHomepagePush.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("agentDashboard"), url: "/agent/dashboard" },
    { name: t("homepagePush"), url: "/agent/homepage-push" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentHomepagePushContainer />
    </div>
  );
}
