import { DollarSign, TrendingUp, Award } from "lucide-react";

export const kpiData = (tAgentEarnings) => [
  {
    title: tAgentEarnings("totalearnings"),
    value: "$45,230",
    icon: DollarSign,
    trend: "up",
    trendValue: "+15.3%",
  },
  {
    title: tAgentEarnings("commissionratecolumn"),
    value: "12.5%",
    icon: TrendingUp,
  },
  { title: tAgentEarnings("topmerchant"), value: "Coffee House", icon: Award },
];

export const monthlyEarnings = [
  { month: "January", earnings: 3200 },
  { month: "February", earnings: 3800 },
  { month: "March", earnings: 3500 },
  { month: "April", earnings: 4200 },
  { month: "May", earnings: 4800 },
  { month: "June", earnings: 5200 },
];

export const commissionBreakdown = [
  {
    merchant: "Coffee House",
    totalSales: 25000,
    commission: 3125,
    rate: "12.5%",
  },
  {
    merchant: "Pizza Palace",
    totalSales: 18000,
    commission: 2250,
    rate: "12.5%",
  },
  {
    merchant: "Beauty Salon",
    totalSales: 15000,
    commission: 1875,
    rate: "12.5%",
  },
  {
    merchant: "Pet Store",
    totalSales: 12000,
    commission: 1500,
    rate: "12.5%",
  },
  {
    merchant: "Book Shop",
    totalSales: 10000,
    commission: 1250,
    rate: "12.5%",
  },
];
