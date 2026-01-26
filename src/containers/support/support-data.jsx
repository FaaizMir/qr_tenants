export const mockMessages = [
    // MASTER INBOX: AGENT SUPPORT
    {
        id: "msg_1",
        senderId: "agent_1",
        senderName: "Mega Marketing Agency",
        senderRole: "Agent",
        targetInbox: "master_agent_support",
        text: "Can you clarify the commission split for UK merchants?",
        timestamp: "2024-06-02T10:00:00Z",
        unread: true,
        history: [
            { role: "Agent", text: "Can you clarify the commission split for UK merchants?", time: "10:00 AM" }
        ]
    },
    {
        id: "msg_5",
        senderId: "agent_2",
        senderName: "Global Solutions Ltd",
        senderRole: "Agent",
        targetInbox: "master_agent_support",
        text: "Requesting white-label domain setup assistance.",
        timestamp: "2024-06-01T09:15:00Z",
        unread: false,
        history: [
            { role: "Agent", text: "Requesting white-label domain setup assistance.", time: "09:15 AM" },
            { role: "Support Staff", text: "Hello, please provide the domain you'd like to use.", time: "11:30 AM" }
        ]
    },
    {
        id: "msg_6",
        senderId: "agent_3",
        senderName: "Digital Growth Partner",
        senderRole: "Agent",
        targetInbox: "master_agent_support",
        text: "Urgent: Billing issue for my June statement.",
        timestamp: "2024-06-03T08:45:00Z",
        unread: true,
        history: [
            { role: "Agent", text: "Urgent: Billing issue for my June statement. The annual fee deduction seems doubled.", time: "08:45 AM" }
        ]
    },

    // MASTER INBOX: MERCHANT SUPPORT (Direct Merchants)
    {
        id: "msg_2",
        senderId: "merch_1",
        senderName: "Pizza Palace",
        senderRole: "Merchant",
        targetInbox: "master_merchant_support",
        text: "Can I get a refund on the credits I bought?",
        timestamp: "2024-06-02T09:30:00Z",
        unread: false,
        history: [
            { role: "Merchant", text: "Can I get a refund on the credits I bought?", time: "09:30 AM" },
            { role: "Support Staff", text: "Hello! Refund requests are processed within 24 hours.", time: "09:45 AM" }
        ]
    },
    {
        id: "msg_4",
        senderId: "merch_temp_1",
        senderName: "Pop-up Store (Temp)",
        senderRole: "Temporary Merchant",
        targetInbox: "master_merchant_support",
        text: "My 7-day trial is ending, how do I extend?",
        timestamp: "2024-06-01T15:20:00Z",
        unread: false,
        history: [
            { role: "Merchant", text: "My 7-day trial is ending, how do I extend?", time: "03:20 PM" }
        ]
    },
    {
        id: "msg_7",
        senderId: "merch_2",
        senderName: "Luxury Boutique",
        senderRole: "Merchant",
        targetInbox: "master_merchant_support",
        text: "Need help setting up my first coupon campaign.",
        timestamp: "2024-06-03T10:00:00Z",
        unread: true,
        history: [
            { role: "Merchant", text: "Hello support, I'm trying to launch my first coupon for the summer collection but getting an error.", time: "10:00 AM" }
        ]
    },

    // AGENT INBOX: MERCHANT SUPPORT (Agent's Merchants)
    // These belong to agent_1
    {
        id: "msg_3",
        senderId: "merch_101",
        senderName: "Coffee House",
        senderRole: "Merchant",
        targetInbox: "agent_merchant_support",
        agentId: "agent_1",
        text: "The QR codes are printing a bit blurry.",
        timestamp: "2024-06-02T11:15:00Z",
        unread: true,
        history: [
            { role: "Merchant", text: "The QR codes are printing a bit blurry. Can you check the image quality?", time: "11:15 AM" }
        ]
    },
    {
        id: "msg_8",
        senderId: "merch_102",
        senderName: "Local Gym",
        senderRole: "Merchant",
        targetInbox: "agent_merchant_support",
        agentId: "agent_1",
        text: "New staff member needs dashboard access.",
        timestamp: "2024-06-02T14:30:00Z",
        unread: false,
        history: [
            { role: "Merchant", text: "Hey! Just hired a manager. How do I add them to my merchant dashboard?", time: "02:30 PM" },
            { role: "Agent", text: "Sure! Go to Settings > User Management to add them.", time: "02:45 PM" }
        ]
    },
    {
        id: "msg_9",
        senderId: "merch_103",
        senderName: "Bakery & Co",
        senderRole: "Merchant",
        targetInbox: "agent_merchant_support",
        agentId: "agent_1",
        text: "Question about WhatsApp credits usage.",
        timestamp: "2024-06-03T11:20:00Z",
        unread: true,
        history: [
            { role: "Merchant", text: "I noticed my BI credits were used for a campaign. Can you explain the difference again?", time: "11:20 AM" }
        ]
    }
];

export const supportFAQs = [
    {
        category: "Merchant",
        questions: [
            { q: "How do I create a new coupon?", a: "Go to the Coupons tab and click 'Create New Coupon Batch'." },
            { q: "What are WA BI credits?", a: "Business Initiated credits are used when you start a conversation with a customer." }
        ]
    },
    {
        category: "Agent",
        questions: [
            { q: "How to set up merchant packages?", a: "Navigate to Master Settings > Packages to define pricing tiers." },
            { q: "Can I customize the domain?", a: "Yes, under Agent Settings > Branding you can add your custom domain." }
        ]
    }
];

export const staticStaffRoles = [
    { id: 1, name: "Support Staff", description: "Manual replies to agent and merchant tickets." },
    { id: 2, name: "Ad Approver", description: "Authorized to approve/reject paid ad submissions." },
    { id: 3, name: "Finance Viewer", description: "ReadOnly access to statements and wallet ledgers." },
    { id: 4, name: "Super Admin", description: "Full platform control and system configuration." }
];
