"use client";

import { PageTabs } from "@/components/common/page-tabs";
import { SubscriptionBadge } from "@/components/common/subscription-badge";
import { CreditDisplay } from "@/components/common/credit-display";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSubscriptionType } from "@/lib/auth-utils";

import { getKpiData, recentRedemptions } from "./dashboard-data";
import { getDashboardTabs } from "./dashboard-tabs";

export default function MerchantDashboardContainer() {
  const subscriptionType = getSubscriptionType();
  const credits = 2500;
  const kpiData = getKpiData(credits);
  const tabs = getDashboardTabs({ kpiData, recentRedemptions });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <SubscriptionBadge type={subscriptionType} />
            <span className="text-muted-foreground">•</span>
            <CreditDisplay credits={credits} />
          </div>
        </div>
        <Link href="/en/merchant/coupons/create">
          <Button>Create New Batch</Button>
        </Link>
      </div>

      <PageTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
