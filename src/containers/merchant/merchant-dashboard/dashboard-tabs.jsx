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
import MerchantFeedbackFormContainer from "@/containers/merchant/merchant-feedbackform";
import MerchantSettings from "@/containers/merchant/merchant-settings/MerchantSettings";
import AutomationSettings from "@/containers/merchant/automation";
import MerchantAdsContainer from "@/containers/merchant/ads";

export const getDashboardTabs = ({
  kpiData,
  recentRedemptions,
  subscriptionType = "temporary",
  creditStats,
  dashboardData,
  loadingDashboard,
}) => {
  const isAnnual = subscriptionType === "annual";

  return [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <CreditsOverview
            data={creditStats}
            dashboardData={dashboardData}
            loading={loadingDashboard}
          />

          <div className="grid gap-6 md:grid-cols-3">
            {/* Placeholder for future: redemptions/automation */}
          </div>

          {/* Integrated Analytics (annual only) */}
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
    // ...(isAnnual
    //   ? [
    //     {
    //       value: "analytics",
    //       label: "Analytics",
    //       content: <MerchantAnalyticsContainer embedded={false} />,
    //     },
    //   ]
    //   : []),
    {
      value: "reviews",
      label: "Settings",
      content: <MerchantSettings />,
    },
    // {
    //   value: "automation",
    //   label: "Automation",
    //   content: <AutomationSettings />,
    // },
    // {
    //   value: "ads",
    //   label: "Ads & Marketplace",
    //   content: <MerchantAdsContainer />,
    // },
    /* {
      value: "feedback-form",
      label: "Feedback Form",
      content: (
        <MerchantFeedbackFormContainer />
      ),
    }, */
    /*{
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
    },*/
  ];
};
