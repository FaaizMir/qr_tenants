import { Ticket, Users, Star, CreditCard } from "lucide-react";

export const getKpiData = (credits) => [
    {
        title: "Total Coupons Issued",
        value: "1,250",
        icon: Ticket,
        trend: "up",
        trendValue: "+8.5%",
    },
    {
        title: "Total Redeemed",
        value: "856",
        icon: Users,
        trend: "up",
        trendValue: "+12%",
    },
    {
        title: "Average Rating",
        value: "4.8",
        icon: Star,
        trend: "up",
        trendValue: "+0.2",
    },
    {
        title: "Remaining Credits",
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
