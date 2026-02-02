"use client";

import ChatLayout from "@/components/chat/chat-layout";

export default function SuperAdminSupportPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Support Dashboard</h1>
            <ChatLayout role="super_admin" />
        </div>
    );
}
