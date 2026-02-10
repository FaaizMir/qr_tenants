"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Shield,
  Clock,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supportFAQs } from "./support-data";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { getMerchants } from "@/lib/services/helper";

export default function SupportContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const { emit, on, off, isConnected } = useSocket();
  const bottomRef = useRef(null);

  // Role normalization
  const role = user?.role?.toUpperCase() || "MERCHANT";
  const isSuperAdmin = role === "SUPER_ADMIN" || role === "MASTER_ADMIN";
  const isAgent = role === "AGENT" || role === "ADMIN";
  const isMerchant = role === "MERCHANT";

  // State
  const [conversations, setConversations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(
    isSuperAdmin ? "agents" : "merchants"
  );
  const [conversationTypeFilter, setConversationTypeFilter] = useState("chat"); // chat, support

  // Fetch conversations and participants
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both regular conversations and support tickets
      const [regularConvRes, supportConvRes] = await Promise.all([
        axiosInstance.get("/chat/conversations").catch(() => ({ data: [] })),
        axiosInstance.get("/chat/support/inbox").catch(() => ({ data: [] }))
      ]);
      
      // Merge both types with category indicator
      // Filter to avoid duplicates and ensure correct categorization
      const regularConversations = (regularConvRes.data || [])
        .filter(conv => !conv.category || conv.category === 'chat') // Only include chat conversations
        .map(conv => ({
          ...conv,
          category: 'chat'
        }));
      
      const supportConversations = (supportConvRes.data || [])
        .filter(conv => conv.category === 'support') // Only include support conversations
        .map(conv => ({
          ...conv,
          category: 'support'
        }));
      
      // Merge and remove duplicates based on ID
      const conversationsMap = new Map();
      [...regularConversations, ...supportConversations].forEach(conv => {
        conversationsMap.set(conv.id, conv);
      });
      
      const allConversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      
      setConversations(allConversations);

      if (isSuperAdmin) {
        if (activeTab === "agents") {
          const res = await axiosInstance.get("/admins");
          setParticipants(res.data.data || []);
        } else {
          setParticipants([]);
        }
      } else if (isAgent && activeTab === "merchants") {
        const res = await getMerchants({ page: 1, pageSize: 100 });
        setParticipants(res.data || []);
      } else if (isAgent && activeTab === "agents") {
        try {
          const res = await axiosInstance.get("/super-admins");
          const sa = res.data.data?.[0] || res.data?.[0];
          if (sa) {
            setParticipants([{ ...sa, name: "Platform Support", role: "SUPER_ADMIN" }]);
          }
        } catch (err) {
          console.error("Failed to fetch super admins:", err);
        }
      } else if (isMerchant) {
        try {
          const merchantData = await axiosInstance.get(`/merchants/${user?.merchantId}`);
          const agentId = merchantData.data?.data?.admin_id || merchantData.data?.admin_id;
          if (agentId) {
            setParticipants([{ id: agentId, name: "Your Support Agent", role: "AGENT" }]);
          }
        } catch (err) {
          console.error("Failed to fetch merchant details for agent lookup:", err);
        }
      }
    } catch (error) {
      console.error("Failed to fetch support data:", error);
      toast.error("Failed to load support data");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, isAgent, isMerchant, activeTab, user?.merchantId]);

  useEffect(() => {
    fetchData();
    
    // Note: Don't force chat mode here - agents need to see all conversations including tickets from merchants
  }, [fetchData]);

  useEffect(() => {
    if (loading) return;

    if (isMerchant) {
      // Filter merchant conversations by type
      let merchantConv;
      if (conversationTypeFilter === 'chat') {
        merchantConv = conversations.find(c => c.type === 'AGENT_MERCHANT' && c.category === 'chat');
      } else if (conversationTypeFilter === 'support') {
        merchantConv = conversations.find(c => c.type === 'AGENT_MERCHANT' && c.category === 'support');
      }
      
      if (merchantConv) {
        setSelectedConversation(merchantConv);
        setSelectedParticipant(null);
      } else if (participants.length > 0) {
        setSelectedParticipant(participants[0]);
        setSelectedConversation(null);
      }
    } else if (isAgent && activeTab === 'agents') {
      // Filter agent conversations by type
      let agentConv;
      if (conversationTypeFilter === 'chat') {
        agentConv = conversations.find(c => c.type === 'SUPERADMIN_AGENT' && c.category === 'chat');
      } else if (conversationTypeFilter === 'support') {
        agentConv = conversations.find(c => c.type === 'SUPERADMIN_AGENT' && c.category === 'support');
      }
      
      if (agentConv) {
        setSelectedConversation(agentConv);
        setSelectedParticipant(null);
      } else if (participants.length > 0) {
        setSelectedParticipant(participants[0]);
        setSelectedConversation(null);
      }
    }
  }, [conversations, isMerchant, isAgent, activeTab, loading, participants, conversationTypeFilter]);

  const handleNewMessage = useCallback((message) => {
    const selectedId = selectedConversation?.id;
    const msgConvId = message.conversation_id || message.conversationId;

    if (selectedConversation && msgConvId === selectedId) {
      setMessages((prev) => [...prev, message]);
    }

    setConversations((prev) => {
      const hasConv = prev.some(c => c.id === msgConvId);
      if (hasConv) {
        return prev.map(conv => {
          if (conv.id === msgConvId) {
            return {
              ...conv,
              messages: [message],
              updated_at: message.created_at || message.createdAt || new Date().toISOString(),
              unread: selectedId !== msgConvId
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      } else {
        // New conversation created - fetch fresh data to get proper categorization
        fetchData();
        return prev;
      }
    });
  }, [selectedConversation, fetchData]);

  useEffect(() => {
    on('newMessage', handleNewMessage);
    return () => off('newMessage', handleNewMessage);
  }, [on, off, handleNewMessage]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Extract fetchMessages as a callback so it can be reused
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    
    try {
      setMessagesLoading(true);
      
      // Use appropriate endpoint based on conversation category
      const isSupport = selectedConversation.category === 'support';
      const endpoint = isSupport 
        ? `/chat/support/conversations/${selectedConversation.id}/messages`
        : `/chat/conversations/${selectedConversation.id}/messages`;
      
      const res = await axiosInstance.get(endpoint, 
        isSupport ? {} : { params: { page: 1, limit: 100 } }
      );
      
      // Handle response format (support returns { conversation, messages }, regular returns direct array)
      const messagesData = res.data.messages || res.data.data || res.data || [];
      setMessages(messagesData);
      emit('joinConversation', { conversationId: selectedConversation.id });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load message history");
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedConversation, emit]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const { activeChats, availableContacts } = useMemo(() => {
    // Filter by role type
    let currentConvs = conversations.filter(c => {
      if (isSuperAdmin) return c.type === 'SUPERADMIN_AGENT';
      if (isAgent) {
        return activeTab === "merchants" ? c.type === 'AGENT_MERCHANT' : c.type === 'SUPERADMIN_AGENT';
      }
      return c.type === 'AGENT_MERCHANT';
    });
    
    // Filter by conversation type (chat, support)
    // Note: For agents on merchants tab, show ALL conversations (chat + tickets from merchants)
    // but the "Chat Only" filter prevents CREATING new tickets
    if (!(isAgent && activeTab === 'merchants')) {
      // Apply filter for non-agent/merchant scenarios
      if (conversationTypeFilter === 'chat') {
        currentConvs = currentConvs.filter(c => c.category === 'chat');
      } else if (conversationTypeFilter === 'support') {
        currentConvs = currentConvs.filter(c => c.category === 'support');
      }
    }
    // For agents with merchants: show both types (no filtering) but creation is restricted

    const activeIds = currentConvs.map(c =>
      isSuperAdmin ? c.agent_id :
        isAgent ? (activeTab === 'merchants' ? c.merchant_id : c.super_admin_id) :
          c.agent_id
    );

    const avContacts = participants.filter(p => !activeIds.includes(p.id));

    return {
      activeChats: currentConvs.map(c => ({ ...c, isConversation: true })),
      availableContacts: avContacts.map(p => ({ ...p, isParticipant: true }))
    };
  }, [conversations, participants, isSuperAdmin, isAgent, isMerchant, activeTab, conversationTypeFilter]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const all = [...activeChats, ...availableContacts];
    if (!q) return all;
    return all.filter(item => {
      const name = item.isConversation ? getParticipantName(item) : (item.name || item.business_name || item.user?.name || "");
      return name.toLowerCase().includes(q);
    });
  }, [activeChats, availableContacts, searchQuery]);

  const handleSend = async () => {
    if (!replyText.trim()) return;

    try {
      if (selectedConversation) {
        const isSupport = selectedConversation.category === 'support';
        
        if (isSupport) {
          // Send message to existing support ticket (HTTP only - backend broadcasts via socket)
          await axiosInstance.post(`/chat/support/conversations/${selectedConversation.id}/messages`, {
            message: replyText
          });
          // Refetch messages to show the sent message immediately
          await fetchMessages();
        } else {
          // Emit via socket for regular chat messages only
          emit('sendMessage', {
            conversationId: selectedConversation.id,
            content: replyText
          });
        }
      } else if (selectedParticipant) {
        // Create new conversation/ticket based on filter
        // Special rule: Agent cannot create tickets to merchants
        const createAsTicket = conversationTypeFilter === 'support' && !(isAgent && activeTab === 'merchants');
        
        if (createAsTicket) {
          // Create new support ticket
          const response = await axiosInstance.post('/chat/support/conversations', {
            message: replyText
          });
          await fetchData();
          if (response.data) {
            setSelectedConversation({ ...response.data, category: 'support' });
            setSelectedParticipant(null);
          }
        } else {
          // Create regular conversation via socket
          const participantId = selectedParticipant.id;
          emit('sendMessage', {
            receiverId: participantId,
            type: activeTab === 'agents' ? 'SUPERADMIN_AGENT' : 'AGENT_MERCHANT',
            content: replyText
          });
          
          // Wait a bit for the conversation to be created, then refresh
          setTimeout(() => {
            fetchData();
          }, 500);
        }
      }
      setReplyText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const getParticipantName = (item) => {
    if (!item) return "User";
    if (item.isConversation) {
      if (isMerchant) return item.agent?.user?.name || "Support Agent";
      if (isAgent) {
        if (activeTab === 'merchants') return item.merchant?.user?.name || item.merchant?.business_name || "Merchant";
        return item.super_admin?.user?.name || item.superAdmin?.user?.name || "Super Admin";
      }
      if (isSuperAdmin) {
        if (activeTab === 'agents') return item.agent?.user?.name || "Agent";
        return item.merchant?.user?.name || item.merchant?.business_name || "Merchant";
      }
    }
    return item.name || item.business_name || item.user?.name || "User";
  };

  const getRoleBadge = (item) => {
    if (!item) return "";
    if (item.isConversation) return item.type.replace('_', ' ');
    return isSuperAdmin ? "Agent" : "Merchant";
  };

  const showSidebar = !isMerchant && !(isAgent && activeTab === 'agents');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Support & Messages
            {!isConnected && <Badge variant="destructive" className="ml-2 text-[10px]">Disconnected</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin && "Manage conversations and support tickets with agents."}
            {isAgent && activeTab === 'merchants' && "Communicate with your merchants via messages and tickets."}
            {isAgent && activeTab === 'agents' && "Contact platform support team."}
            {isMerchant && "Chat with your support agent or create tickets."}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Staff Role: {user?.staffRole || "Super Admin"}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {showSidebar && (
          <Card className="md:col-span-4 lg:col-span-4 flex flex-col overflow-hidden border border-border shadow-sm">
            <CardHeader className="p-4 space-y-4 pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-9">
                  {isSuperAdmin ? (
                    <div className="flex items-center px-4 w-full text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 rounded-md">
                      Agents
                    </div>
                  ) : (
                    <>
                      <TabsTrigger value="merchants" className="text-xs">My Merchants</TabsTrigger>
                      <TabsTrigger value="agents" className="text-xs">Support Admin</TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {/* Show filters conditionally based on role and tab */}
                {(isSuperAdmin || isMerchant || (isAgent && activeTab === 'agents')) ? (
                  <div className="flex gap-1.5 p-1 bg-muted/30 rounded-lg">
                    <button
                      onClick={() => setConversationTypeFilter('chat')}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                        conversationTypeFilter === 'chat'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </button>
                    <button
                      onClick={() => setConversationTypeFilter('support')}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                        conversationTypeFilter === 'support'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <HelpCircle className="h-3 w-3" />
                      Tickets
                    </button>
                  </div>
                ) : (
                  // Agent with merchants: Only chat creation allowed but can view all conversation types
                  <div className="flex gap-1.5 p-1 bg-muted/30 rounded-lg">
                    <div className="flex-1 px-2 py-1.5 text-[10px] font-medium rounded bg-background shadow-sm text-foreground flex items-center justify-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      View All • Create Chat Only
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-9 text-sm bg-muted/30 border-none focus-visible:ring-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-0.5 px-2 pb-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No items found.</div>
                  ) : (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.isConversation) {
                            setSelectedConversation(item);
                            setSelectedParticipant(null);
                          } else {
                            setSelectedParticipant(item);
                            setSelectedConversation(null);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${(selectedConversation?.id === item.id || selectedParticipant?.id === item.id)
                          ? "bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-muted/50"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm truncate">{getParticipantName(item)}</span>
                          {item.isConversation && item.messages?.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/100 whitespace-nowrap pt-0.5">
                              {(() => {
                                const lastMsg = item.messages[item.messages.length - 1];
                                const d = lastMsg.created_at || lastMsg.createdAt || item.updated_at;
                                return d ? format(new Date(d), "MMM d") : "";
                              })()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-wider h-4 px-1`}>
                            {getRoleBadge(item)}
                          </Badge>
                          {item.isConversation && item.category === 'support' && (
                            <Badge variant="default" className="text-[9px] h-4 px-1 bg-blue-500">
                              <HelpCircle className="h-2.5 w-2.5 mr-0.5" />
                              Ticket
                            </Badge>
                          )}
                          {item.isConversation && item.category === 'chat' && (
                            <Badge variant="default" className="text-[9px] h-4 px-1 bg-green-500">
                              <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                              Chat
                            </Badge>
                          )}
                          {!item.isConversation && conversationTypeFilter === 'support' && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">NEW TICKET</Badge>
                          )}
                          {!item.isConversation && conversationTypeFilter !== 'support' && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">NEW CHAT</Badge>
                          )}
                        </div>
                        <p className="text-xs truncate text-muted-foreground">
                          {item.isConversation ? (item.messages?.[item.messages.length - 1]?.content || "No messages") : 
                            (conversationTypeFilter === 'support' ? "Create a new support ticket" : "Start a new conversation")}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Card className={`${showSidebar ? "md:col-span-8 lg:col-span-8" : "md:col-span-12"} flex flex-col overflow-hidden border border-border shadow-sm relative ${!selectedConversation && isMerchant ? "md:flex" : ""}`}>
          {(selectedConversation || selectedParticipant) ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getParticipantName(selectedConversation || selectedParticipant).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-bold">
                      {getParticipantName(selectedConversation || selectedParticipant)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-[11px]">
                      <Clock className="h-3 w-3" />
                      {selectedConversation ? (
                        <>
                          {selectedConversation.category === 'support' ? (
                            <Badge variant="default" className="text-[9px] h-4 px-1 bg-blue-500">
                              <HelpCircle className="h-2.5 w-2.5 mr-0.5" />
                              Ticket
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[9px] h-4 px-1 bg-green-500">
                              <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                              Chat
                            </Badge>
                          )}
                        </>
                      ) : (
                        <>
                          {conversationTypeFilter === 'support' ? (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">NEW TICKET</Badge>
                          ) : conversationTypeFilter === 'chat' ? (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">NEW CHAT</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">NEW MESSAGE</Badge>
                          )}
                        </>
                      )}
                      <span>•</span>
                      <span className="text-primary font-medium">{getRoleBadge(selectedConversation || selectedParticipant)}</span>
                    </CardDescription>
                  </div>
                </div>
                
                {/* Show filter when sidebar is hidden (for merchant or agent on support admin tab) */}
                {!showSidebar && (
                  // Only show filters for merchant or agent on support admin tab (both can use chat/tickets)
                  // Agent on merchants tab won't have sidebar hidden so this won't show for them
                  <div className="flex gap-1.5 p-1 bg-muted/30 rounded-lg">
                    <button
                      onClick={() => setConversationTypeFilter('chat')}
                      className={`px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${
                        conversationTypeFilter === 'chat'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </button>
                    <button
                      onClick={() => setConversationTypeFilter('support')}
                      className={`px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${
                        conversationTypeFilter === 'support'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <HelpCircle className="h-3 w-3" />
                      Tickets
                    </button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-6">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <div>
                        <h3 className="font-bold">No messages yet</h3>
                        <p className="text-sm text-muted-foreground">Send a message to start the conversation.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-4xl mx-auto flex flex-col">
                      {messages.map((msg, i) => {
                        // Determine if the message is from current user
                        // Primary: compare sender_id to logged-in user.id (same as main chat)
                        const senderId = msg.sender_id || msg.senderId;
                        const senderRole = (msg.sender_role || msg.senderRole || "").toLowerCase();

                        let isMe = false;
                        if (senderId != null && user?.id != null) {
                          isMe = Number(senderId) === Number(user.id);
                        }

                        // Fallback: role-based match for ticket messages that might not include sender_id
                        if (!isMe) {
                          if (isSuperAdmin && senderRole === "super_admin") {
                            isMe = true;
                          } else if (isAgent && (senderRole === "agent" || senderRole === "admin")) {
                            isMe = true;
                          } else if (isMerchant && senderRole === "merchant") {
                            isMe = true;
                          }
                        }

                        return (
                          <div
                            key={msg.id || i}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                          >
                            {/* Match chat section: Sent (ME) on RIGHT - Blue | Received (THEM) on LEFT - White */}
                            {isMe ? (
                              <div className="flex flex-row-reverse gap-3 max-w-[85%] sm:max-w-[70%] text-right">
                                <Avatar className="h-8 w-8 mt-auto mb-1 shrink-0">
                                  <AvatarFallback className="bg-primary text-white text-[10px] font-bold">ME</AvatarFallback>
                                </Avatar>
                                <div className="group relative">
                                  <div className="p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-primary text-white rounded-br-none text-left">
                                    {msg.content}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 px-1 justify-end">
                                    <span className="text-[10px] text-muted-foreground/70 font-medium">
                                      {(() => {
                                        const d = msg.created_at || msg.createdAt;
                                        return d ? format(new Date(d), "h:mm a") : "";
                                      })()}
                                    </span>
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-3 max-w-[85%] sm:max-w-[70%]">
                                <Avatar className="h-8 w-8 mt-auto mb-1 shrink-0">
                                  <AvatarFallback className="bg-muted text-[10px] font-bold">
                                    {getParticipantName(selectedConversation || selectedParticipant).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="group relative">
                                  <div className="p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed bg-white border border-border text-foreground rounded-bl-none text-left">
                                    {msg.content}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 px-1 justify-start">
                                    <span className="text-[10px] text-muted-foreground/70 font-medium">
                                      {(() => {
                                        const d = msg.created_at || msg.createdAt;
                                        return d ? format(new Date(d), "h:mm a") : "";
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={bottomRef} className="h-2" />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 bg-card border-t mt-auto">
                  <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="relative">
                      <Textarea
                        placeholder="Type a message..."
                        className="min-h-[80px] bg-muted/20 border-border/50 resize-none focus-visible:ring-primary/30 p-4 pb-12 rounded-xl text-sm"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      />
                      <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-medium">Press Enter to send</div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSend} disabled={!replyText.trim() || !isConnected} className="h-9 px-6 gap-2 rounded-full shadow-lg">
                        Send Message <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5 space-y-8">
              {/* Show filter when sidebar is hidden */}
              {!showSidebar && (
                <div className="absolute top-4 right-4 flex gap-1.5 p-1 bg-muted/30 rounded-lg">
                  <button
                    onClick={() => setConversationTypeFilter('chat')}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${
                      conversationTypeFilter === 'chat'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </button>
                  <button
                    onClick={() => setConversationTypeFilter('support')}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${
                      conversationTypeFilter === 'support'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <HelpCircle className="h-3 w-3" />
                    Tickets
                  </button>
                </div>
              )}
              
              <div className="max-w-md w-full text-center space-y-6">
                <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-primary/5">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Support Center</h2>
                  <p className="text-muted-foreground mt-2">
                    {conversationTypeFilter === 'support' ? "Create a new support ticket or view existing tickets." : "Start a conversation or continue chatting."}
                  </p>
                  {!showSidebar && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left text-xs space-y-2">
                      <p className="font-medium text-foreground">💡 Choose your message type:</p>
                      <p><span className="text-green-600 font-medium">Chat:</span> Quick casual messages</p>
                      <p><span className="text-blue-600 font-medium">Tickets:</span> Formal support requests</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
