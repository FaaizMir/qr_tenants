import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ShoppingBag,
  Ticket,
  Wallet
} from "lucide-react";

export const getKpiData = (t) => [
  {
    title: t("totalmerchants") || "Total Merchants",
    value: "124",
    icon: Users,
    trend: "up",
    trendValue: "+12%",
    description: "14 new this month",
  },
  {
    title: t("monthlyrevenue") || "Monthly Revenue",
    value: "$4,250",
    icon: DollarSign,
    trend: "up",
    trendValue: "+8%",
    description: "vs. $3,935 last month",
  },
  {
    title: "Wallet Balance",
    value: "$1,200.50",
    icon: Wallet,
    trend: "neutral",
    trendValue: "Stable",
    description: "Prepaid Credits Available",
  },
  {
    title: "Active Campaigns",
    value: "45",
    icon: Ticket,
    trend: "up",
    trendValue: "+5",
    description: "Global campaigns running",
  },
];

export const getRecentActivities = (t) => [
  {
    id: 1,
    merchant: "Burger King - Downtown",
    action: "Purchased 'Boost' Package (30 Days)",
    amount: "+$45.00",
    time: "2 mins ago",
    type: "credit",
  },
  {
    id: 2,
    merchant: "System: WhatsApp Usage",
    action: "Daily Message Deduction (150 msgs)",
    amount: "-$1.50",
    time: "1 hour ago",
    type: "debit",
  },
  {
    id: 3,
    merchant: "Pizza Hut - Mall",
    action: "New Merchant Registration",
    amount: "",
    time: "3 hours ago",
    type: "info",
  },
  {
    id: 4,
    merchant: "Subway - Central",
    action: "Coupon Limit Reached Alert",
    amount: "",
    time: "5 hours ago",
    type: "alert",
  },
  {
    id: 5,
    merchant: "Wallet Top-up",
    action: "Manual Deposit via Stripe",
    amount: "+$500.00",
    time: "1 day ago",
    type: "credit",
  },
];

export const getFinancialSummary = () => ({
  earnings: {
    monthly: "$4,250",
    total: "$152,000",
    growth: "+12.5%",
  },
  costs: {
    platformFees: "$850",
    whatsappFees: "$320",
  }
});
