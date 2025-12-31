import { BarChart3, TrendingUp, Users, Star, MessageCircle, Gift } from "lucide-react";

export const metrics = [
    {
        title: "Coupons Issued",
        value: "1,245",
        icon: TrendingUp,
        trend: "up",
        trendValue: "+12%",
        description: "Total coupons via all channels"
    },
    {
        title: "Coupons Redeemed",
        value: "856",
        icon: BarChart3,
        trend: "up",
        trendValue: "+18%",
        description: "Successfully claimed in-store"
    },
    {
        title: "WhatsApp Sent",
        value: "3,402",
        icon: MessageCircle,
        trend: "up",
        trendValue: "+5%",
        description: "Automated & manual blasts"
    },
    {
        title: "Reviews Collected",
        value: "428",
        icon: Star,
        trend: "up",
        trendValue: "+24%",
        description: "Avg Rating: 4.8/5.0"
    },
    {
        title: "Returning Customers",
        value: "215",
        icon: Users,
        trend: "up",
        trendValue: "+8%",
        description: "Visited > 2 times this month"
    },
    {
        title: "Lucky Draw Spins",
        value: "380",
        icon: Gift,
        trend: "down",
        trendValue: "-2%",
        description: "Participation in gamified rewards"
    },
];

export const redemptionTrend = [120, 150, 180, 220, 250, 300, 320, 450, 480, 500, 520, 600];
