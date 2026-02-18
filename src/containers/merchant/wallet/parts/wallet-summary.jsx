"use client";

import { BarChart3, Timer, Info, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const format = (num) => (typeof num === "number" ? num.toLocaleString() : "--");

export default function WalletSummary({
  balance,
  summary,
  merchantType,
  expiresAt,
  className = "",
}) {
  const t = useTranslations("merchantWallet.summary");
  const usage = summary?.usage || {};
  const stats = [
    {
      label: t("creditsUsed"),
      value: format(usage.used),
      icon: BarChart3,
    },
    {
      label: t("creditsRemaining"),
      value: format(balance),
      icon: Shield,
    },
    ...(merchantType === "TEMPORARY"
      ? [
          {
            label: t("expiresAt"),
            value: expiresAt
              ? new Date(expiresAt).toLocaleDateString()
              : t("notProvided"),
            icon: Timer,
          },
        ]
      : []),
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-muted/50 bg-muted/30 px-3 py-3"
          >
            <stat.icon className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-lg font-semibold">{stat.value}</div>
            </div>
          </div>
        ))}
        {merchantType === "ANNUAL" && (
          <div className="flex items-center gap-3 rounded-lg border border-muted/50 bg-muted/30 px-3 py-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">{t("tiersVisible")}</div>
              <div className="text-lg font-semibold">
                {t("marketingUtility")}
              </div>
            </div>
          </div>
        )}
        {merchantType === "TEMPORARY" && (
          <div className="flex items-center gap-3 rounded-lg border border-muted/50 bg-muted/30 px-3 py-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">{t("tierVisible")}</div>
              <div className="text-lg font-semibold">{t("temporaryReadOnly")}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
