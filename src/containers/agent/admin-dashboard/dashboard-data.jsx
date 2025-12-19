import { Users, DollarSign, UserCheck } from "lucide-react";

export const getKpiData = (t) => [
  {
    title: t("totalmerchants"),
    value: "45",
    icon: Users,
    trend: "up",
    trendValue: "+12%",
  },
  {
    title: t("totalearnings"),
    value: "$12,450",
    icon: DollarSign,
    trend: "up",
    trendValue: "+8.2%",
  },
  {
    title: t("activemerchants"),
    value: "38",
    icon: UserCheck,
    trend: "up",
    trendValue: "+5%",
  },
];

export const getRecentActivities = (tAgentDashboard) => [
  {
    id: 1,
    merchant: "Coffee House",
    action: "New subscription",
    time: "2 hours ago",
  },
  {
    id: 2,
    merchant: "Pizza Palace",
    action: "Coupon batch created",
    time: "5 hours ago",
  },
  {
    id: 3,
    merchant: "Beauty Salon",
    action: "Credits purchased",
    time: "1 day ago",
  },
  {
    id: 4,
    merchant: "Pet Store",
    action: "WhatsApp campaign activated",
    time: "2 days ago",
  },
  {
    id: 5,
    merchant: "Book Shop",
    action: "Annual subscription renewed",
    time: "3 days ago",
  },
];
