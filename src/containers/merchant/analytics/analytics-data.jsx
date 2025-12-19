import { BarChart3, TrendingUp, Users, Star } from "lucide-react";

export const metrics = [
    {
        title: "Monthly Reviews",
        value: "128",
        icon: Star,
        trend: "up",
        trendValue: "+15%",
    },
    {
        title: "Coupons Distributed",
        value: "450",
        icon: TrendingUp,
        trend: "up",
        trendValue: "+8%",
    },
    {
        title: "Redemption Rate",
        value: "65%",
        icon: BarChart3,
        trend: "up",
        trendValue: "+5%",
    },
    {
        title: "Credits Used",
        value: "850",
        icon: Users,
        trend: "down",
        trendValue: "-2%",
    },
];

export const redemptionTrend = [120, 150, 180, 220, 250, 300];
