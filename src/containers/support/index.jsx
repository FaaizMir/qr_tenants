"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Send,
  User,
  Search,
  Check,
  CheckCheck,
  Building2,
  Mail,
  Shield,
  Clock,
  Image as ImageIcon,
  ChevronRight,
  Filter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMessages, supportFAQs, staticStaffRoles } from "./support-data";
import { format } from "date-fns";
import { HelpCircle, Sparkles } from "lucide-react";

export default function SupportContainer() {
  const { data: session } = useSession();
  const user = session?.user;

  // Normalize role and specific IDs
  const role = user?.role?.toLowerCase() || "merchant";
  const isMaster = role === "super_admin" || role === "master_admin";
  const isAgent = role === "agent" || role === "admin"; // 'admin' often used for agent admins
  const isMerchant = role === "merchant";

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(
    isMaster ? "agents" : isAgent ? "merchants" : "inbox",
  );

  // Filtering logic based on role and active tab
  const conversations = useMemo(() => {
    let filtered = [...mockMessages];

    if (isMaster) {
      if (activeTab === "agents") {
        filtered = filtered.filter(
          (m) => m.targetInbox === "master_agent_support",
        );
      } else {
        filtered = filtered.filter(
          (m) => m.targetInbox === "master_merchant_support",
        );
      }
    } else if (isAgent) {
      // Agents see their own merchants contacting them
      // and their own conversation with Master (optional if we put it in separate tab)
      if (activeTab === "merchants") {
        filtered = filtered.filter(
          (m) =>
            m.targetInbox === "agent_merchant_support" &&
            m.agentId === user?.id,
        );
      } else {
        // Conversation with Master
        filtered = filtered.filter(
          (m) =>
            m.targetInbox === "master_agent_support" && m.senderId === user?.id,
        );
      }
    } else if (isMerchant) {
      // Merchants only see their own conversation
      filtered = filtered.filter((m) => m.senderId === user?.id);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [isMaster, isAgent, isMerchant, activeTab, searchQuery, user?.id]);

  const handleSend = () => {
    if (!replyText.trim()) return;
    // In a real app, this would push to the thread history
    setReplyText("");
    // alert("Message sent manually.");
  };

  const getRoleBadgeColor = (r) => {
    switch (r?.toLowerCase()) {
      case "agent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "merchant":
        return "bg-green-100 text-green-700 border-green-200";
      case "temporary merchant":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Support Inbox
          </h1>
          <p className="text-sm text-muted-foreground">
            {isMaster &&
              "Manage support communications for agents and direct merchants."}
            {isAgent &&
              "Communicate with your merchants and the main platform."}
            {isMerchant && "Get help from your support team."}
          </p>
        </div>

        {isMaster && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Staff Role: {user?.staffRole || "Super Admin"}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Sidebar / List View */}
        <Card
          className={`md:col-span-4 lg:col-span-4 flex flex-col overflow-hidden border border-border shadow-sm ${isMerchant && "hidden md:flex"}`}
        >
          <CardHeader className="p-4 space-y-4 pb-0">
            {isMaster && (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-9">
                  <TabsTrigger value="agents" className="text-xs">
                    Agents
                  </TabsTrigger>
                  <TabsTrigger value="merchants" className="text-xs">
                    Merchants
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {isAgent && (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-9">
                  <TabsTrigger value="merchants" className="text-xs">
                    My Merchants
                  </TabsTrigger>
                  <TabsTrigger value="main" className="text-xs">
                    Main Platform
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 h-9 text-sm bg-muted/30 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-0.5 px-2 pb-4">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No conversations found.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${
                        selectedConversation?.id === conv.id
                          ? "bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`font-semibold text-sm truncate ${conv.unread ? "text-foreground" : "text-foreground/80"}`}
                        >
                          {conv.senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                          {format(new Date(conv.timestamp), "MMM d")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase tracking-wider h-4 px-1 ${getRoleBadgeColor(conv.senderRole)}`}
                        >
                          {conv.senderRole}
                        </Badge>
                        {conv.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <p
                        className={`text-xs truncate ${conv.unread ? "font-medium text-foreground/90" : "text-muted-foreground"}`}
                      >
                        {conv.text}
                      </p>

                      {selectedConversation?.id === conv.id && (
                        <div className="absolute right-3 bottom-3">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Conversation Area */}
        <Card className="md:col-span-8 lg:col-span-8 flex flex-col overflow-hidden border border-border shadow-sm">
          {selectedConversation ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {selectedConversation.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-bold">
                      {selectedConversation.senderName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last active:{" "}
                        {format(
                          new Date(selectedConversation.timestamp),
                          "h:mm a",
                        )}
                      </span>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        {selectedConversation.senderRole}
                      </span>
                    </CardDescription>
                  </div>
                </div>

                <div className="hidden sm:flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" /> Mark as Unread
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-dot-pattern">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Date Separator */}
                    <div className="flex justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                        Today,{" "}
                        {format(
                          new Date(selectedConversation.timestamp),
                          "MMMM do",
                        )}
                      </span>
                    </div>

                    {selectedConversation.history.map((msg, i) => {
                      const isMe =
                        msg.role === "Support Staff" ||
                        (isAgent && msg.role === "Agent") ||
                        (isMerchant && msg.role === "Merchant");

                      return (
                        <div
                          key={i}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                          {!isMe && (
                            <Avatar className="h-8 w-8 mt-auto mb-1 shrink-0">
                              <AvatarFallback className="bg-muted text-[10px] font-bold">
                                {selectedConversation.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`group relative max-w-[85%] sm:max-w-[70%]`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-tr-none"
                                  : "bg-card border rounded-tl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <div
                              className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <span className="text-[10px] text-muted-foreground/70 font-medium">
                                {msg.time}
                              </span>
                              {isMe && (
                                <CheckCheck className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          </div>

                          {isMe && (
                            <Avatar className="h-8 w-8 mt-auto mb-1 shrink-0">
                              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                                ME
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Reply Area */}
                <div className="p-4 bg-card border-t mt-auto shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.1)]">
                  <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="relative">
                      <Textarea
                        placeholder="Type a manual reply..."
                        className="min-h-[100px] bg-muted/20 border-border/50 resize-none focus-visible:ring-primary/30 p-4 pb-12 rounded-xl text-sm transition-all"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <div className="absolute left-3 bottom-3 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-medium">
                        Press Enter to send
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSend}
                        disabled={!replyText.trim()}
                        className="h-9 px-6 gap-2 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Send Message <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : isMerchant ? (
            // Dedicated Merchant Contact View (if they have no history or first time)
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/5 overflow-y-auto">
              <div className="max-w-md w-full text-center space-y-6">
                <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-primary/5">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Contact Support</h2>
                  <p className="text-muted-foreground mt-2">
                    Need help with your QR codes or coupons? Message your
                    support team directly.
                  </p>
                </div>

                <div className="text-left space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" /> Common
                    Questions
                  </h4>
                  <div className="space-y-2">
                    {supportFAQs
                      .find((f) => f.category === "Merchant")
                      ?.questions.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-card border rounded-lg text-xs"
                        >
                          <p className="font-bold mb-1">Q: {faq.q}</p>
                          <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <Card className="text-left border-dashed">
                  <CardContent className="p-4 space-y-4 pt-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        New Message
                      </label>
                      <Textarea
                        placeholder="Describe your issue..."
                        className="mt-1 bg-muted/20"
                        rows={3}
                      />
                    </div>
                    <Button className="w-full gap-2">
                      Start Conversation <Send className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5 space-y-8 overflow-y-auto">
              <div className="max-w-lg w-full space-y-8">
                <div>
                  <div className="h-20 w-20 bg-muted/30 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <Mail className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a message from the sidebar to view the full thread
                    and reply manually.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" /> System Roles
                    </h4>
                    {staticStaffRoles.map((role) => (
                      <div
                        key={role.id}
                        className="p-3 bg-card border rounded-xl shadow-sm"
                      >
                        <p className="text-xs font-bold">{role.name}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                          {role.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Quick Tips
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-[11px]">
                        Manual replies are sent in real-time to the
                        recipient&apos;s dashboard.
                      </div>
                      {supportFAQs
                        .find((f) => f.category === "Agent")
                        ?.questions.map((faq, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-card border rounded-xl text-[11px]"
                          >
                            <span className="font-bold">FAQ:</span> {faq.q}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
