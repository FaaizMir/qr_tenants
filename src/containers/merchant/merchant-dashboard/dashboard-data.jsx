import { Ticket, Users, Star, CreditCard } from "lucide-react";

export const getKpiData = (credits, t) => [
    {
        title: t("kpi.totalCouponsIssued"),
        value: "1,250",
        icon: Ticket,
        trend: t("kpi.trendUp"),
        trendValue: "+8.5%",
    },
    {
        title: t("kpi.totalRedeemed"),
        value: "856",
        icon: Users,
        trend: t("kpi.trendUp"),
        trendValue: "+12%",
    },
    {
        title: t("kpi.averageRating"),
        value: "4.8",
        icon: Star,
        trend: t("kpi.trendUp"),
        trendValue: "+0.2",
    },
    {
        title: t("kpi.remainingCredits"),
        value: credits.toLocaleString(),
        icon: CreditCard,
    },
];

export const recentRedemptions = [
    {
        id: 1,
        code: "SUMMER20-X8Y9",
        customer: "John Doe",
        time: "10 mins ago",
        amount: "$5.00",
    },
    {
        id: 2,
        code: "WELCOME-A1B2",
        customer: "Jane Smith",
        time: "45 mins ago",
        amount: "$10.00",
    },
    {
        id: 3,
        code: "SUMMER20-C3D4",
        customer: "Mike Johnson",
        time: "1 hour ago",
        amount: "$5.00",
    },
];
