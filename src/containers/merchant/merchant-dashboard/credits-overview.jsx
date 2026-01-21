import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers, CheckCircle, MessageCircle, Users, Trophy, Star, TrendingUp, UserPlus, Gift, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditsOverview({ data, dashboardData, loading }) {

  if (loading || !dashboardData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/20" />
        ))}
      </div>
    );
  }

  const { overview, couponStats, feedbackStats, whatsappStats, luckyDrawStats, customerStats } = dashboardData;

  const metrics = [
    {
      label: "Total Coupons",
      value: overview.totalCoupons,
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bgClass: "from-blue-50 to-white dark:from-blue-950/50 dark:to-background border-blue-200 dark:border-blue-900",
      iconBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Redeemed",
      value: overview.totalCouponsRedeemed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgClass: "from-green-50 to-white dark:from-green-950/50 dark:to-background border-green-200 dark:border-green-900",
      iconBg: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Messages Sent",
      value: overview.whatsappMessagesSent,
      icon: MessageCircle,
      color: "text-purple-600 dark:text-purple-400",
      bgClass: "from-purple-50 to-white dark:from-purple-950/50 dark:to-background border-purple-200 dark:border-purple-900",
      iconBg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Total Customers",
      value: overview.totalCustomers,
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgClass: "from-orange-50 to-white dark:from-orange-950/50 dark:to-background border-orange-200 dark:border-orange-900",
      iconBg: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  // Helper for SVG Pie Chart with separators and labels
  const CouponPieChart = () => {
    const data = [
      { label: "Created", value: Number(couponStats.byStatus.created) || 0, color: "#06b6d4" }, // cyan-500
      { label: "Issued", value: Number(couponStats.byStatus.issued) || 0, color: "#3b82f6" },  // blue-500
      { label: "Redeemed", value: Number(couponStats.byStatus.redeemed) || 0, color: "#22c55e" }, // green-500
      { label: "Expired", value: Number(couponStats.byStatus.expired) || 0, color: "#ef4444" },   // red-500
    ];

    const total = data.reduce((acc, cur) => acc + cur.value, 0);

    if (total === 0) {
      return <div className="text-center text-muted-foreground py-8">No coupon data</div>;
    }

    let currentAngle = 0;
    const radius = 90; // Balanced size
    const centerX = 120; // Balanced center
    const centerY = 120; // Balanced center

    return (
      <div className="flex flex-col xl:flex-row items-center justify-center gap-6 p-2">
        {/* SVG Pie Chart */}
        <div className="relative w-[240px] h-[240px] shrink-0">
          <svg viewBox="0 0 240 240" className="w-full h-full rotate-[-90deg]">
            {data.map((slice, i) => {
              if (slice.value === 0) return null;

              const sliceAngle = (slice.value / total) * 360;
              const x1 = centerX + radius * Math.cos((Math.PI * currentAngle) / 180);
              const y1 = centerY + radius * Math.sin((Math.PI * currentAngle) / 180);

              const endAngle = currentAngle + sliceAngle;
              const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
              const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

              // Calculate text position (midpoint of the slice)
              const midAngle = currentAngle + sliceAngle / 2;
              const textX = centerX + (radius * 0.6) * Math.cos((Math.PI * midAngle) / 180);
              const textY = centerY + (radius * 0.6) * Math.sin((Math.PI * midAngle) / 180);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;

              // If there's only one slice (100%), draw a circle
              const pathData = total === slice.value
                ? `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`
                : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              const percentage = Math.round((slice.value / total) * 100);

              const element = (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                  {percentage > 5 && (
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(90 ${textX} ${textY})`} // Counter-rotate text because SVG is rotated -90
                    >
                      {percentage}%
                    </text>
                  )}
                </g>
              );

              currentAngle += sliceAngle;
              return element;
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-2 text-sm">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground whitespace-nowrap">{item.label}</span>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Top Level Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className={cn("overflow-hidden border shadow-sm", item.bgClass)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-full", item.iconBg)}>
                    <Icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{item.value?.toLocaleString() ?? 0}</h3>
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
            <CouponPieChart />
          </CardContent>
        </Card>

        {/* Metric Cards Row */}
        {/* Returning Customers */}
        <Card className="md:col-span-1 border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-500" /> Returning Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <div className="text-3xl font-bold">{customerStats.returningCustomersThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Users returning this month</p>
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
            <div className="text-3xl font-bold">{overview.luckyDrawParticipation}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Spins</p>
          </CardContent>
        </Card>

        {/* Total Feedbacks */}
        <Card className="md:col-span-1 border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Total Feedbacks
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center pb-8">
            <div className="text-3xl font-bold">{overview.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers feedback received</p>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
