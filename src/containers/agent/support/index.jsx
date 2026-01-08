"use client";

import { useState } from "react";
import { MessageSquare, Send, User, ChevronRight, AlertCircle, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { tickets } from "./support-data";

export default function AgentSupportContainer() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleEscalate = () => {
    // Logic to move ticket to Admin queue
    alert("Ticket escalated to Admin Support (L2).");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Merchant Support</h1>
          <p className="text-muted-foreground">Level-1 Support Desk for your onboarded merchants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
        {/* Ticket List */}
        <Card className="col-span-1 border-r flex flex-col">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg flex justify-between items-center">
              Inbox
              <Badge variant="secondary" className="font-normal text-xs">{tickets.length} tickets</Badge>
            </CardTitle>
            <div className="relative mt-2">
              <Input placeholder="Search tickets..." className="h-8 text-xs pl-8" />
              <MessageSquare className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/40 group ${selectedTicket?.id === ticket.id ? "bg-muted/60 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate w-[60%]">
                      {ticket.merchant}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {ticket.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mb-1 text-foreground/90">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/70 transition-colors">
                    {ticket.lastMessage}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={ticket.status} className="h-5 px-1.5 text-[10px]" />
                    <span className="text-[10px] text-muted-foreground">#TKT-{ticket.id}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="col-span-1 md:col-span-2 flex flex-col shadow-md">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b py-3 px-6 bg-muted/5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {selectedTicket.subject}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {selectedTicket.merchant}</span>
                      <span>•</span>
                      <span>Ticket #{selectedTicket.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleEscalate}>
                      <ArrowUpRight className="h-4 w-4 mr-2" /> Escalate to Admin
                    </Button>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-950">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Auto-generated start message */}
                    <div className="flex justify-center">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Ticket Opened {selectedTicket.date}
                      </span>
                    </div>

                    {/* Merchant Message */}
                    <div className="flex justify-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">M</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 border rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                        <p className="text-sm leading-relaxed">{selectedTicket.lastMessage}</p>
                        <span className="text-[10px] text-muted-foreground mt-2 block w-full text-right opacity-70">
                          Merchant • 10:30 AM
                        </span>
                      </div>
                    </div>

                    {/* Agent Reply (Mock) */}
                    <div className="flex justify-end gap-3">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 max-w-[80%] shadow-sm">
                        <p className="text-sm leading-relaxed">
                          Hello! I can certainly help with that. Could you please provide a screenshot of the error you are seeing?
                        </p>
                        <span className="text-[10px] text-primary-foreground/70 mt-2 block w-full text-right">
                          You (Agent) • 10:35 AM
                        </span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">A</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </ScrollArea>

                {/* Reply Area */}
                <div className="p-4 border-t bg-muted/10">
                  <div className="flex flex-col gap-3">
                    <Textarea
                      placeholder="Type your reply here... (Enter to send)"
                      className="min-h-[80px] bg-background resize-none focus-visible:ring-1"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>Pressing <strong>Enter</strong> sends the message</span>
                      </div>
                      <Button className="h-9 px-6 gap-2" disabled={!replyText}>
                        Send Reply <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 p-8 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a Ticket</h3>
              <p className="max-w-xs">Click on a conversation from the left sidebar to view details and reply to merchants.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
