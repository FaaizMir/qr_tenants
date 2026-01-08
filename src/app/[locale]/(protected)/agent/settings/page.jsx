import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentSettingsContainer from "@/containers/agent/settings";
import { getTranslations } from "next-intl/server";

export default async function AgentSettingsPage() {
    const t = await getTranslations("agent.settings");

    const breadcrumbData = [
        { name: "Dashboard", url: "/agent/dashboard" },
        { name: "Platform Settings", url: "/agent/settings" },
    ];

    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <AgentSettingsContainer />
        </>
    );
}
