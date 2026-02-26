"use client";

import ChatLayout from "@/components/chat/chat-layout";
import { useTranslations } from "next-intl";

export default function AgentSupportPage() {
    const t = useTranslations("support.page.supportPages.agentSupport");
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
            <ChatLayout role="admin" />
        </div>
    );
}
