"use client";

import ChatLayout from "@/components/chat/chat-layout";

export default function AgentSupportPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Agent Support</h1>
            <ChatLayout role="admin" />
        </div>
    );
}
