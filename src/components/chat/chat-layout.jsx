"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { useSession } from "next-auth/react";

import axios from "axios";

export default function ChatLayout({ role }) {
    const { socket, isConnected } = useSocket();
    const { data: session } = useSession();
    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to match contact to conversation
    const findConversationForContact = (convs, contact, currentUserRole) => {
        return convs.find(c => {
            if (contact.type === 'SUPERADMIN_AGENT') {
                if (currentUserRole === 'super_admin') return c.agent_id === contact.id;
                if (currentUserRole === 'admin') return c.super_admin_id === contact.id;
            }
            if (contact.type === 'AGENT_MERCHANT') {
                if (currentUserRole === 'admin' || currentUserRole === 'agent') return c.merchant_id === contact.id;
                if (currentUserRole === 'merchant') return c.agent_id === contact.id;
            }
            return false;
        });
    };

    // Fetch Contacts
    useEffect(() => {
        if (!session?.access_token) return;
        const fetchContacts = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/chat/contacts`,
                    { headers: { Authorization: `Bearer ${session.access_token}` } }
                );
                setContacts(response.data);
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            }
        };
        fetchContacts();
    }, [session?.access_token]);

    // Initialize Socket Listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.emit("getConversations");

        socket.on("conversations", (data) => {
            setConversations(data);
        });

        socket.on("messages", (data) => {
            // Check if matches active conversation (ID could be number or draft string)
            // If draft, we might receive messages once it becomes real? 
            // Actually, when we send a message in draft, server creates convo and we get 'newMessage'.
            if (data.conversationId === activeConversationId) {
                setMessages(data.data);
            }
        });

        socket.on("newMessage", (message) => {
            // Update messages if conversation is active
            if (activeConversationId === message.conversationId) {
                setMessages((prev) => [...prev, message]);
            } else if (typeof activeConversationId === 'string' && activeConversationId.startsWith('draft:')) {
                // If we were in a draft and received a message for the new real conversation,
                // we should probably switch to the real conversation ID?
                // But for now, let's just let the conversation list update.
            }

            // Update conversation list to show latest message preview
            setConversations((prev) => {
                const exists = prev.find(c => c.id === message.conversationId);
                if (exists) {
                    return prev.map(c => {
                        if (c.id === message.conversationId) {
                            return {
                                ...c,
                                messages: [...(c.messages || []), message],
                                updated_at: new Date().toISOString()
                            };
                        }
                        return c;
                    }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                } else {
                    // New conversation created by someone else or self?
                    // We should re-fetch conversations or add it.
                    // For simplicity, re-fetch.
                    socket.emit("getConversations");
                    return prev;
                }
            });

            // If we were in a draft state and we just sent this message, successful send means we should now switch to the real conversation ID
            // But we don't know the real conversation ID easily unless we match it.
            // Simple hack: If we have a draft selected, and a new message comes in for that participant, switch access.
            // Leaning on 'getConversations' refresh for now.
        });

        return () => {
            socket.off("conversations");
            socket.off("messages");
            socket.off("newMessage");
        };
    }, [socket, isConnected, activeConversationId]);

    // Handle Conversation Selection
    useEffect(() => {
        if (!activeConversationId || !socket) return;

        // If it's a draft, just clear messages
        if (typeof activeConversationId === 'string' && activeConversationId.startsWith('draft:')) {
            setMessages([]);
            return;
        }

        socket.emit("joinConversation", { conversationId: activeConversationId });
        socket.emit("getMessages", { conversationId: activeConversationId });

    }, [activeConversationId, socket]);

    // Auto-switch from Draft to Real Conversation
    useEffect(() => {
        if (typeof activeConversationId === 'string' && activeConversationId.startsWith('draft:')) {
            const [, type, receiverId] = activeConversationId.split(':');
            const contact = contacts.find(c => c.id === Number(receiverId) && c.type === type);

            if (contact) {
                const existing = findConversationForContact(conversations, contact, role);
                if (existing) {
                    setActiveConversationId(existing.id);
                }
            }
        }
    }, [conversations, activeConversationId, contacts, role]);

    const handleSendMessage = (content) => {
        if (!socket || !activeConversationId) return;

        if (typeof activeConversationId === 'string' && activeConversationId.startsWith('draft:')) {
            const [, type, receiverId] = activeConversationId.split(':');
            socket.emit("sendMessage", {
                receiverId: Number(receiverId),
                type: type,
                content,
            });
        } else {
            socket.emit("sendMessage", {
                conversationId: activeConversationId,
                content,
            });
        }
    };

    // Merge Contacts and Conversations for Display
    // We want to show all contacts. If a conversation exists, show it. If not, show as draft.
    const mergedList = contacts.map(contact => {
        const existing = findConversationForContact(conversations, contact, role);

        if (existing) {
            return {
                ...existing,
                participantName: contact.name,
                participantAvatar: contact.avatar,
                isDraft: false
            };
        } else {
            return {
                id: `draft:${contact.type}:${contact.id}`,
                participantName: contact.name,
                participantAvatar: contact.avatar,
                isDraft: true,
                updated_at: 0, // Bottom of list or top? User wants list of agents.
                messages: []
            };
        }
    }).sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        // Prioritize active conversations over drafts naturally by date
        return dateB - dateA;
    });

    // Also need to include conversations that might not match current contacts list? 
    // (e.g. inactive agents? or if contact list pagination limit?)
    // For now, assume contact list is comprehensive enough or primary source.
    // Ensure we don't miss conversations if contact fetch fails?
    // Let's union them properly if needed. But simplest is 'Contacts is the source of truth for the list'.

    const activeConversation = mergedList.find(c => c.id === activeConversationId);

    // Loading state handling could be better but sufficient for v1

    if (!session) return <div className="flex items-center justify-center p-10">Loading session...</div>;

    return (
        <div className="flex h-[calc(100vh-6rem)] border rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="w-1/3 min-w-[300px] border-r">
                <ConversationList
                    conversations={mergedList}
                    activeConversationId={activeConversationId}
                    onSelect={setActiveConversationId}
                    currentUserRole={role}
                />
            </div>
            <div className="flex-1 flex flex-col">
                {activeConversationId ? (
                    <ChatWindow
                        messages={messages}
                        activeConversation={activeConversation}
                        currentUserId={session.user.id}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                        <p className="text-lg">Select a contact to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
