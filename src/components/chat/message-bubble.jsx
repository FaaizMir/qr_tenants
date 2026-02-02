"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, ShieldCheck, Store } from "lucide-react";

export const MessageBubble = ({ message, isCurrentUser }) => {
    return (
        <div
            className={cn(
                "flex w-full mt-2 space-x-3 max-w-xs md:max-w-md",
                isCurrentUser ? "ml-auto justify-end" : "justify-start"
            )}
        >
            {!isCurrentUser && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {message.sender_role === 'super_admin' && <ShieldCheck size={16} />}
                    {message.sender_role === 'admin' && <User size={16} />}
                    {message.sender_role === 'agent' && <User size={16} />}
                    {message.sender_role === 'merchant' && <Store size={16} />}
                </div>
            )}
            <div
                className={cn(
                    "relative px-4 py-2 rounded-lg shadow-sm text-sm break-words",
                    isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                )}
            >
                <p>{message.content}</p>
                <span
                    className={cn(
                        "text-[10px] mt-1 block text-right opacity-70",
                        isCurrentUser ? "text-blue-100" : "text-gray-400"
                    )}
                >
                    {format(new Date(message.created_at), "HH:mm")}
                </span>
            </div>
        </div>
    );
};
