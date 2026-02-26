// This file contains mock data and FAQs for the support system
// To use translations, import useTranslations from 'next-intl' in the component that uses this data

export const getMockMessages = (t) => [
  // MASTER INBOX: AGENT SUPPORT
  {
    id: "msg_1",
    senderId: "agent_1",
    senderName: t("support.supportData.senderNames.megaMarketing"),
    senderRole: t("support.supportData.roles.agent"),
    targetInbox: "master_agent_support",
    text: t("support.supportData.mockMessages.agent1.question"),
    timestamp: "2024-06-02T10:00:00Z",
    unread: true,
    history: [
      {
        role: t("support.supportData.roles.agent"),
        text: t("support.supportData.mockMessages.agent1.history"),
        time: "10:00 AM",
      },
    ],
  },
  {
    id: "msg_5",
    senderId: "agent_2",
    senderName: t("support.supportData.senderNames.globalSolutions"),
    senderRole: t("support.supportData.roles.agent"),
    targetInbox: "master_agent_support",
    text: t("support.supportData.mockMessages.agent2.question"),
    timestamp: "2024-06-01T09:15:00Z",
    unread: false,
    history: [
      {
        role: t("support.supportData.roles.agent"),
        text: t("support.supportData.mockMessages.agent2.history1"),
        time: "09:15 AM",
      },
      {
        role: t("support.supportData.roles.supportStaff"),
        text: t("support.supportData.mockMessages.agent2.history2"),
        time: "11:30 AM",
      },
    ],
  },
  {
    id: "msg_6",
    senderId: "agent_3",
    senderName: t("support.supportData.senderNames.digitalGrowth"),
    senderRole: t("support.supportData.roles.agent"),
    targetInbox: "master_agent_support",
    text: t("support.supportData.mockMessages.agent3.question"),
    timestamp: "2024-06-03T08:45:00Z",
    unread: true,
    history: [
      {
        role: t("support.supportData.roles.agent"),
        text: t("support.supportData.mockMessages.agent3.history"),
        time: "08:45 AM",
      },
    ],
  },

  // MASTER INBOX: MERCHANT SUPPORT (Direct Merchants)
  {
    id: "msg_2",
    senderId: "merch_1",
    senderName: t("support.supportData.senderNames.pizzaPalace"),
    senderRole: t("support.supportData.roles.merchant"),
    targetInbox: "master_merchant_support",
    text: t("support.supportData.mockMessages.merchant1.question"),
    timestamp: "2024-06-02T09:30:00Z",
    unread: false,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchant1.history1"),
        time: "09:30 AM",
      },
      {
        role: t("support.supportData.roles.supportStaff"),
        text: t("support.supportData.mockMessages.merchant1.history2"),
        time: "09:45 AM",
      },
    ],
  },
  {
    id: "msg_4",
    senderId: "merch_temp_1",
    senderName: t("support.supportData.senderNames.popupStore"),
    senderRole: t("support.supportData.roles.temporaryMerchant"),
    targetInbox: "master_merchant_support",
    text: t("support.supportData.mockMessages.merchantTemp1.question"),
    timestamp: "2024-06-01T15:20:00Z",
    unread: false,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchantTemp1.history"),
        time: "03:20 PM",
      },
    ],
  },
  {
    id: "msg_7",
    senderId: "merch_2",
    senderName: t("support.supportData.senderNames.luxuryBoutique"),
    senderRole: t("support.supportData.roles.merchant"),
    targetInbox: "master_merchant_support",
    text: t("support.supportData.mockMessages.merchant2.question"),
    timestamp: "2024-06-03T10:00:00Z",
    unread: true,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchant2.history"),
        time: "10:00 AM",
      },
    ],
  },

  // AGENT INBOX: MERCHANT SUPPORT (Agent's Merchants)
  // These belong to agent_1
  {
    id: "msg_3",
    senderId: "merch_101",
    senderName: t("support.supportData.senderNames.coffeeHouse"),
    senderRole: t("support.supportData.roles.merchant"),
    targetInbox: "agent_merchant_support",
    agentId: "agent_1",
    text: t("support.supportData.mockMessages.merchant101.question"),
    timestamp: "2024-06-02T11:15:00Z",
    unread: true,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchant101.history"),
        time: "11:15 AM",
      },
    ],
  },
  {
    id: "msg_8",
    senderId: "merch_102",
    senderName: t("support.supportData.senderNames.localGym"),
    senderRole: t("support.supportData.roles.merchant"),
    targetInbox: "agent_merchant_support",
    agentId: "agent_1",
    text: t("support.supportData.mockMessages.merchant102.question"),
    timestamp: "2024-06-02T14:30:00Z",
    unread: false,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchant102.history1"),
        time: "02:30 PM",
      },
      {
        role: t("support.supportData.roles.agent"),
        text: t("support.supportData.mockMessages.merchant102.history2"),
        time: "02:45 PM",
      },
    ],
  },
  {
    id: "msg_9",
    senderId: "merch_103",
    senderName: t("support.supportData.senderNames.bakery"),
    senderRole: t("support.supportData.roles.merchant"),
    targetInbox: "agent_merchant_support",
    agentId: "agent_1",
    text: t("support.supportData.mockMessages.merchant103.question"),
    timestamp: "2024-06-03T11:20:00Z",
    unread: true,
    history: [
      {
        role: t("support.supportData.roles.merchant"),
        text: t("support.supportData.mockMessages.merchant103.history"),
        time: "11:20 AM",
      },
    ],
  },
];

export const getSupportFAQs = (t) => [
  {
    category: t("support.supportData.faqs.merchant.category"),
    questions: [
      {
        q: t("support.supportData.faqs.merchant.q1"),
        a: t("support.supportData.faqs.merchant.a1"),
      },
      {
        q: t("support.supportData.faqs.merchant.q2"),
        a: t("support.supportData.faqs.merchant.a2"),
      },
    ],
  },
  {
    category: t("support.supportData.faqs.agent.category"),
    questions: [
      {
        q: t("support.supportData.faqs.agent.q1"),
        a: t("support.supportData.faqs.agent.a1"),
      },
      {
        q: t("support.supportData.faqs.agent.q2"),
        a: t("support.supportData.faqs.agent.a2"),
      },
    ],
  },
];

export const getStaticStaffRoles = (t) => [
  {
    id: 1,
    name: t("support.supportData.staffRoles.supportStaff.name"),
    description: t("support.supportData.staffRoles.supportStaff.description"),
  },
  {
    id: 2,
    name: t("support.supportData.staffRoles.adApprover.name"),
    description: t("support.supportData.staffRoles.adApprover.description"),
  },
  {
    id: 3,
    name: t("support.supportData.staffRoles.financeViewer.name"),
    description: t("support.supportData.staffRoles.financeViewer.description"),
  },
  {
    id: 4,
    name: t("support.supportData.staffRoles.superAdmin.name"),
    description: t("support.supportData.staffRoles.superAdmin.description"),
  },
];

// Legacy exports for backward compatibility (not recommended - use the getter functions above)
export const mockMessages = [];
export const supportFAQs = [];
export const staticStaffRoles = [];
