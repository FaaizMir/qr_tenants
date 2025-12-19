import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className = "",
}) {
  const isTrendPositive = trend === "up";
  const tAgentDashboard = useTranslations("dashboard.agentDashboard");
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trendValue && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {isTrendPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={isTrendPositive ? "text-green-500" : "text-red-500"}
            >
              {trendValue}
            </span>
            <span>{tAgentDashboard("lastmonth")}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
