import { Sparkles } from "lucide-react";
import { CreditsOverview } from "@/containers/merchant/merchant-dashboard/credits-overview";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";

const format = (num) => {
  const n = Number(num);
  return !isNaN(n) ? n.toLocaleString() : "--";
};

const UpgradeCard = ({ feeData, adminId }) => {
  const t = useTranslations("merchantDashboard.upgrade");
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!feeData || !adminId) {
      toast.error(t("errorMissingInfo"));
      return;
    }

    try {
      setUpgrading(true);
      const amount = Number(feeData.fee) * 100; // cents

      // Save package info for success page
      localStorage.setItem(
        "stripe_package",
        JSON.stringify({
          id: "merchant-annual-upgrade",
          name: "Annual Merchant Subscription",
          price: feeData.fee,
          currency: feeData.currency,
          admin_id: adminId,
        }),
      );

      // Create checkout session
      const res = await axiosInstance.post("/stripe/create-checkout-session", {
        amount: amount,
        currency: feeData.currency || "usd",
        package_id: 0,
      });

      if (res.data?.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      } else {
        throw new Error(t("errorNoSessionUrl"));
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      toast.error(t("errorPaymentFailed"));
      setUpgrading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-500/10 blur-3xl opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-blue-900">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-blue-700/80">
            {t("description")}
          </CardDescription>
        </div>
        <div className="rounded-full bg-blue-200 p-2 text-blue-700">
          <Sparkles className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-blue-900">
          {feeData
            ? `${feeData.currency || "USD"} ${format(feeData.fee)}`
            : "--"}
          <span className="text-sm font-normal text-blue-700 ml-1">
            {t("pricePerYear")}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          disabled={!feeData || upgrading}
          onClick={handleUpgrade}
        >
          {upgrading ? t("processing") : t("upgradeNow")}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Container Imports
import MerchantCouponsListingContainer from "@/containers/merchant/coupons/listing";
import MerchantWalletContainer from "@/containers/merchant/wallet";
import MerchantAnalyticsContainer from "@/containers/merchant/analytics";
import MerchantSettings from "@/containers/merchant/merchant-settings/MerchantSettings";

export const useDashboardTabs = ({
  creditStats,
  dashboardData,
  loadingDashboard,
  subscriptionType = "temporary",
  feeData,
  adminId,
}) => {
  const t = useTranslations("merchantDashboard.tabs");
  const isAnnual = subscriptionType === "annual";

  return [
    {
      value: "overview",
      label: t("overview"),
      content: (
        <div className="space-y-6">
          {!isAnnual && <UpgradeCard feeData={feeData} adminId={adminId} />}
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
      label: t("coupons"),
      content: <MerchantCouponsListingContainer embedded={true} />,
    },
    {
      value: "Adsight",
      label: t("analytics"),
      content: <MerchantAnalyticsContainer embedded={true} />,
    },
    {
      value: "wallet",
      label: t("wallet"),
      content: <MerchantWalletContainer embedded={true} />,
    },
    {
      value: "settings",
      label: t("settings"),
      content: <MerchantSettings />,
    },
  ];
};
