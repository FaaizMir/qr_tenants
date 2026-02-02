"use client";

import { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatWindow = ({
    messages,
    activeConversation,
    currentUserId,
    onSendMessage,
    isLoading
}) => {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">
                        {/* Display name logic based on role - passed from parent or calculated here? 
                For simplicity, display conversation ID or generic title if generic. 
                Ideally parent passes title. */}
                        {activeConversation.participantName || `Conversation #${activeConversation.id}`}
                    </h2>
                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Active
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">No messages yet. Say hello!</div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isCurrentUser={Number(msg.sender_id) === Number(currentUserId)}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none py-3 px-4 text-sm"
                            rows={1}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className={cn(
                            "p-3 rounded-xl bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                            isLoading && "animate-pulse"
                        )}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};
