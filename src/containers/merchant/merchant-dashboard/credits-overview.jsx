"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  Layers,
  CheckCircle,
  MessageCircle,
  Users,
  Trophy,
  Star,
  TrendingUp,
  UserPlus,
  Gift,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// SVG Pie Chart moved outside component to avoid recreating component during render
function CouponPieChart({ couponStats }) {
  // Handle multiple possible data structures from API response
  const byStatus = couponStats?.byStatus || {};
  const issued =
    Number(byStatus?.issued) || Number(couponStats?.totalCouponsIssued) || 0;
  const redeemed =
    Number(byStatus?.redeemed) ||
    Number(couponStats?.totalCouponsRedeemed) ||
    0;

  // Calculate unredeemed
  const unredeemed = issued - redeemed;

  const data = [
    {
      label: "Redeemed",
      value: redeemed,
      color: "#10b981",
    }, // green
    {
      label: "Unredeemed",
      value: unredeemed,
      color: "#f59e0b",
    }, // amber
  ].filter((item) => item.value > 0);

  const total = redeemed + unredeemed;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">No coupons issued yet</p>
      </div>
    );
  }

  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  let startAngle = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {data.map((item, index) => {
          if (item.value === 0) return null;
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const angle = (percentage / 100) * Math.PI * 2;
          const endAngle = startAngle + angle;

          // Calculate the path for the pie slice
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);

          // Determine if the arc is large or small
          const largeArcFlag = angle > Math.PI ? "1" : "0";

          // Create the path data
          const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          startAngle += angle;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="w-full space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreditsOverview({ data, dashboardData, loading }) {
  const { data: session } = useSession();

  if (loading || !dashboardData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/20" />
        ))}
      </div>
    );
  }

  // Normalize possible nested API shapes. Some responses wrap analytics under
  // `data.overview.data` while others provide top-level fields. Prefer the
  // deeply nested shape when present.
  const normalized =
    dashboardData?.data?.overview?.data ||
    dashboardData?.overview?.data ||
    dashboardData?.data ||
    dashboardData ||
    {};

  const {
    overview = {},
    couponStats = { byStatus: {} },
    feedbackStats = {},
    whatsappStats = {},
    luckyDrawStats = {},
    customerStats = {},
  } = normalized;

  const user = session?.user;
  const sessionType =
    user?.subscriptionType?.toString?.().toLowerCase() || "temporary";
  const isTemporary = sessionType !== "annual";

  const metrics = [
    {
      label: "Total Coupons",
      value: overview.totalCoupons ?? 0,
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bgClass:
        "from-blue-50 to-white dark:from-blue-950/50 dark:to-background border-blue-200 dark:border-blue-900",
      iconBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Redeemed",
      value: overview.totalCouponsRedeemed ?? 0,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgClass:
        "from-green-50 to-white dark:from-green-950/50 dark:to-background border-green-200 dark:border-green-900",
      iconBg: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Messages Sent",
      value:
        whatsappStats.totalMessagesSent ?? overview.whatsappMessagesSent ?? 0,
      icon: MessageCircle,
      color: "text-purple-600 dark:text-purple-400",
      bgClass:
        "from-purple-50 to-white dark:from-purple-950/50 dark:to-background border-purple-200 dark:border-purple-900",
      iconBg: "bg-purple-100 dark:bg-purple-900",
    },
    // Show UI / BI breakdown: always show UI; hide BI for temporary merchants
    {
      label: "UI Messages",
      value: whatsappStats.uiMessages?.total ?? 0,
      icon: MessageSquare,
      color: "text-violet-600 dark:text-violet-400",
      bgClass:
        "from-violet-50 to-white dark:from-violet-950/50 dark:to-background border-violet-200 dark:border-violet-900",
      iconBg: "bg-violet-100 dark:bg-violet-900",
    },
    ...(!isTemporary
      ? [
          {
            label: "BI Messages",
            value: whatsappStats.biMessages?.total ?? 0,
            icon: Trophy,
            color: "text-amber-600 dark:text-amber-400",
            bgClass:
              "from-amber-50 to-white dark:from-amber-950/50 dark:to-background border-amber-200 dark:border-amber-900",
            iconBg: "bg-amber-100 dark:bg-amber-900",
          },
        ]
      : []),
    {
      label: "Total Customers",
      value: overview.totalCustomers ?? 0,
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgClass:
        "from-orange-50 to-white dark:from-orange-950/50 dark:to-background border-orange-200 dark:border-orange-900",
      iconBg: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Top Level Metrics */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className={cn(
                "overflow-hidden rounded-xl shadow-lg",
                item.bgClass,
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-extrabold mt-2">
                      {(item.value ?? 0).toLocaleString()}
                    </h3>
                  </div>
                  <div
                    className={cn("p-3 rounded-full shadow-md", item.iconBg)}
                  >
                    <Icon className={cn("w-8 h-8", item.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
        {/* Coupon Status Chart */}
        <Card className="md:col-span-2 lg:col-span-2 border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Coupon Status</CardTitle>
            <CardDescription>Distribution of all coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <CouponPieChart couponStats={couponStats} />
          </CardContent>
        </Card>

        {/* Returning Customers */}
        <Card className="md:col-span-1 border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-500" /> Returning
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <div className="text-3xl font-bold">
              {customerStats.returningCustomersThisMonth ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Users returning this month
            </p>
          </CardContent>
        </Card>

        {/* Lucky Draw Participation */}
        <Card className="md:col-span-1 border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Lucky Draw
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <div className="text-3xl font-bold">
              {overview.luckyDrawParticipation ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Spins</p>
          </CardContent>
        </Card>

        {/* Total Feedbacks */}
        <Card className="md:col-span-1 border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Total
              Feedbacks
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <div className="text-3xl font-bold">
              {overview.totalFeedbacks ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customers feedback received
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
