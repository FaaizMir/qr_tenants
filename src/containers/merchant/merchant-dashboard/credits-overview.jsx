import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layers, CheckCircle, MessageCircle, Users, Trophy, Star, TrendingUp, UserPlus, Gift } from "lucide-react";
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
      value: overview.totalCouponsIssued,
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
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 p-4">
        {/* SVG Pie Chart */}
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-90deg]">
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
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-3 text-sm">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">({item.value})</span>
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

      <div className="grid gap-6 md:grid-cols-7">

        {/* Coupon Status Chart - Spans 3 columns */}
        <Card className="md:col-span-3 border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Coupon Status</CardTitle>
            <CardDescription>Distribution of all coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <CouponPieChart />
          </CardContent>
        </Card>

        {/* Breakdown Stats - Spans 4 columns */}
        <div className="md:col-span-4 space-y-6">

          {/* Feedback Stats */}
          <Card className="border-muted/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                  Feedback & Reviews
                </CardTitle>
                <div className="text-sm text-muted-foreground font-medium">
                  {feedbackStats.totalReviews} Total Reviews
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Google</div>
                  <div className="font-bold text-lg">{feedbackStats.byPlatform.google}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Facebook</div>
                  <div className="font-bold text-lg">{feedbackStats.byPlatform.facebook}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">Instagram</div>
                  <div className="font-bold text-lg">{feedbackStats.byPlatform.instagram}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">XiaoHongShu</div>
                  <div className="font-bold text-lg">{feedbackStats.byPlatform.xiaohongshu}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm p-3 bg-primary/5 rounded-lg border border-primary/10">
                <span className="text-muted-foreground">Redirect Completion Rate</span>
                <span className="font-mono font-bold text-primary">{feedbackStats.redirectCompletionRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Stats (Simple list for now) */}
          <Card className="border-muted/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Coupon Delivery</span>
                <span className="font-medium">{whatsappStats.couponDeliverySent}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Lucky Draw Notifications</span>
                <span className="font-medium">{whatsappStats.luckyDrawNotificationsSent}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Campaign Messages</span>
                <span className="font-medium">{whatsappStats.campaignMessagesSent}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-muted-foreground font-medium">Estimated Cost</span>
                <span className="font-bold text-green-700">${whatsappStats.estimatedCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lucky Draw Stats */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Lucky Draw Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="text-center w-1/3">
                <div className="text-2xl font-bold">{luckyDrawStats.totalSpins}</div>
                <div className="text-xs text-muted-foreground">Total Spins</div>
              </div>
              <div className="text-center w-1/3 border-x">
                <div className="text-2xl font-bold">{luckyDrawStats.totalPrizesWon}</div>
                <div className="text-xs text-muted-foreground">Prizes Won</div>
              </div>
              <div className="text-center w-1/3">
                <div className="text-2xl font-bold">{luckyDrawStats.claimRate}%</div>
                <div className="text-xs text-muted-foreground">Claim Rate</div>
              </div>
            </div>

            {luckyDrawStats.prizeDistribution.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium mb-2">Prizes Won</div>
                {luckyDrawStats.prizeDistribution.map((prize, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{prize.name}</span>
                    <span className="font-mono">{prize.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md">
                No prizes distributed yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              Customer Growth (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {customerStats.newCustomersThisMonth}
                </span>
                <span className="text-sm text-muted-foreground">New Customers</span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {customerStats.returningCustomersThisMonth}
                </span>
                <span className="text-sm text-muted-foreground">Returning Users</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Top Customers</h4>
              {customerStats.topCustomers.length > 0 ? (
                <div className="space-y-3">
                  {customerStats.topCustomers.map((cust, i) => {
                    const name = cust?.name || "Unknown";
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {name.charAt(0)}
                          </div>
                          <span>{name}</span>
                        </div>
                        <span className="font-medium text-muted-foreground">{cust?.redemptions || 0} redemptions</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No top customers data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
