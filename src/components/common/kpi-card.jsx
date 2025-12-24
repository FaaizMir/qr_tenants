import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className = "",
  description,
}) {
  const isTrendPositive = trend === "up";
  const isTrendNeutral = trend === "neutral";

  // Handle translations safely or default to standard text
  let footerText = "from last month";
  try {
    const t = useTranslations("dashboard.agentDashboard");
    footerText = t("lastmonth");
  } catch (error) {
    // Fallback if provider is missing
  }

  // Allow override
  if (description) footerText = description;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border-muted/60",
        "bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-card dark:via-card dark:to-muted/10", // Subtle gradient instead of icon
        className
      )}
    >

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "p-2.5 rounded-xl shadow-sm transition-all duration-300",
            "bg-primary/5 text-primary ring-1 ring-primary/10 group-hover:bg-primary/10 group-hover:scale-110"
          )}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>

          {trendValue && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              isTrendPositive
                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                : isTrendNeutral
                  ? "bg-gray-50 text-gray-700 border-gray-100"
                  : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900"
            )}>
              {isTrendPositive ? <TrendingUp className="w-3 h-3" /> : (isTrendNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              {trendValue}
            </div>
          )}
        </div>

        <div className="space-y-1 relative">
          <h3 className="text-sm font-medium text-muted-foreground/80">{title}</h3>
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          {footerText}
        </div>
      </CardContent>
    </Card>
  );
}
