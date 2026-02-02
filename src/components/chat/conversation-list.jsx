"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, ShieldCheck, Store, Search } from "lucide-react";

export const ConversationList = ({
    conversations,
    activeConversationId,
    onSelect,
    currentUserRole
}) => {
    const getParticipantIcon = (conversation) => {
        // We can infer icon from merged data or keep this logic?
        // Merged data has 'role' of contact.
        // But conversation object might be original typeorm entity OR draft.
        // Draft has 'participantAvatar' and we know the role from contact.

        // Simplification:
        if (currentUserRole === 'super_admin') return <User className="w-5 h-5" />; // Agent
        if (currentUserRole === 'admin' || currentUserRole === 'agent') {
            if (conversation.role === 'super_admin' || conversation.type === 'SUPERADMIN_AGENT') return <ShieldCheck className="w-5 h-5" />;
            return <Store className="w-5 h-5" />; // Merchant
        }
        if (currentUserRole === 'merchant') return <User className="w-5 h-5" />; // Agent

        return <User className="w-5 h-5" />;
    };

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        placeholder="Search conversations..."
                        className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left",
                                    isActive && "bg-blue-50 hover:bg-blue-50 border-r-4 border-blue-600"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    {getParticipantIcon(conv)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={cn("font-medium truncate", isActive ? "text-blue-900" : "text-gray-900")}>
                                            {conv.participantName || "Unknown"}
                                        </h3>
                                        {lastMessage && (
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {format(new Date(lastMessage.created_at), "HH:mm")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {lastMessage ? lastMessage.content : "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
