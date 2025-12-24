import Link from "next/link";
import { Ticket, MessageSquare } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card";
import { CreditsOverview } from "@/containers/merchant/merchant-dashboard/credits-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Container Imports
import MerchantCouponsListingContainer from "@/containers/merchant/coupons/listing";
import MerchantWalletContainer from "@/containers/merchant/wallet";
import MerchantAnalyticsContainer from "@/containers/merchant/analytics";

export const getDashboardTabs = ({
  kpiData,
  recentRedemptions,
  subscriptionType = "temporary",
  creditStats,
}) => {
  const isAnnual = subscriptionType === "annual";

  return [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          {/* Stats Grid */}
          <CreditsOverview data={creditStats} />

          <div className="grid gap-6 md:grid-cols-3">
            {/* Placeholder for future: redemptions/automation */}
          </div>

          {/* Integrated Analytics (annual only) */}
          {isAnnual ? (
            <>
              <div className="flex flex-col space-y-1.5 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
                <p className="text-muted-foreground">
                  Track your coupon performance, redemptions, and customer engagement.
                </p>
              </div>
              <MerchantAnalyticsContainer embedded={true} creditsUsed={creditStats?.creditsUsed} />
            </>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  Analytics & exports (Annual only)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Annual merchants get full analytics, exports, and customer
                  data visibility. Temporary merchants have limited dashboards
                  and higher WhatsApp credit costs.
                </p>
                <div className="flex gap-2">
                  <Link href="/en/merchant/coupons/create">
                    <Button size="sm">Create batch</Button>
                  </Link>
                  <Link href="/en/merchant/campaigns">
                    <Button size="sm" variant="outline">
                      Review campaigns
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      value: "coupons",
      label: "Coupon Batches",
      content: <MerchantCouponsListingContainer embedded={true} />,
    },
    {
      value: "wallet",
      label: "Wallet",
      content: <MerchantWalletContainer embedded={true} />,
    },
    ...(isAnnual
      ? [
        {
          value: "analytics",
          label: "Analytics",
          content: <MerchantAnalyticsContainer embedded={false} />,
        },
      ]
      : []),
    {
      value: "settings",
      label: "Settings",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings content coming soon...
            </p>
          </CardContent>
        </Card>
      ),
    },
  ];
};
