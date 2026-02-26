"use client";

import ChatLayout from "@/components/chat/chat-layout";
import { useTranslations } from "next-intl";

export default function SuperAdminSupportPage() {
    const t = useTranslations("support.page.supportPages.supportDashboard");
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
            <ChatLayout role="super_admin" />
        </div>
    );
}
