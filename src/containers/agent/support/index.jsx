"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function AgentSupportContainer() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Dummy ticket data
  const tickets = [
    {
      id: 1,
      merchant: "Coffee House",
      subject: "Issue with coupon redemption",
      status: "open",
      date: "2024-06-02",
      lastMessage: "The QR code scanner is not responding...",
    },
    {
      id: 2,
      merchant: "Pizza Palace",
      subject: "Question about billing",
      status: "resolved",
      date: "2024-05-30",
      lastMessage: "Thank you for clarifying the charges.",
    },
    {
      id: 3,
      merchant: "Beauty Salon",
      subject: "Feature request",
      status: "open",
      date: "2024-06-01",
      lastMessage: "Can we add birthday automations?",
    },
    {
      id: 4,
      merchant: "Pet Store",
      subject: "Login trouble",
      status: "resolved",
      date: "2024-05-25",
      lastMessage: "Password reset worked, thanks!",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">Manage merchant support tickets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Ticket List */}
        <Card className="col-span-1 border-r">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[530px]">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedTicket?.id === ticket.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold truncate">
                    {ticket.merchant}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.date}
                  </span>
                </div>
                <p className="text-sm font-medium truncate mb-1">
                  {ticket.subject}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {ticket.lastMessage}
                </p>
                <div className="mt-2">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="col-span-1 md:col-span-2 flex flex-col">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ticket #{selectedTicket.id} • {selectedTicket.merchant}
                    </p>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
                  {/* Dummy conversation */}
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg p-3 max-w-[80%] shadow-sm">
                      <p className="text-sm">{selectedTicket.lastMessage}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        10:30 AM
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%] shadow-sm">
                      <p className="text-sm">
                        Hello, thanks for reaching out. We are looking into this
                        for you.
                      </p>
                      <span className="text-xs text-primary-foreground/70 mt-1 block">
                        10:35 AM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reply Area */}
                <div className="p-4 border-t bg-background">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      className="min-h-[80px]"
                    />
                    <Button className="h-auto self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Select a ticket to view conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
