"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// Components
import PlatformSettings from "./components/PlatformSettings";
import PresetReviewsSettings from "./components/PresetReviewsSettings";
import RewardStrategySettings from "./components/RewardStrategySettings";
import BirthdayRewardsSettings from "./components/BirthdayRewardsSettings";
import InactiveRecallSettings from "./components/InactiveRecallSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Rocket, Zap, Megaphone } from "lucide-react";

import FeatureMasterControl from "./components/FeatureMasterControl";
import PaidAdsSettings from "./components/PaidAdsSettings";
import MerchantCampaigns from "./campaigns/campaign";
import FestivalMessages from "./festival-messages/festival";

export default function MerchantSettings() {
  const t = useTranslations("merchantSettings");
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const router = useRouter();
  const pathname = usePathname();

  const subscriptionType =
    session?.user?.subscriptionType?.toString?.().toLowerCase() || "temporary";
  const isAnnual = subscriptionType === "annual";

  // State for active tab - initialize from URL if available
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subtab = params.get("subtab");
      return subtab || "settings";
    }
    return "settings";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    // Get base path without query params
    const basePath = pathname.split("?")[0];
    router.push(`${basePath}?tab=settings&subtab=${value}`, { scroll: false });
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-1000 pb-20 overflow-x-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-6 border-b border-gray-100 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-gray-900 rounded-full text-[10px] font-semibold text-white shadow-lg">
              {t("main.title")}
            </div>
            <div className="h-px w-10 bg-gray-200" />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {t("main.version")}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-none">
            {t("main.subtitle")} <span className="text-primary">{t("main.subtitleHighlight")}</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            {t("main.description")}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5" />
              </div>
            ))}
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-semibold text-gray-400 leading-none">
              {t("main.status")}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {t("main.merchantActive")}
            </p>
          </div>
        </div>
      </div>

      <FeatureMasterControl />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-8"
      >
        <div className="flex items-center justify-items-start">
          <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl h-auto border border-gray-200/50 backdrop-blur-sm shadow-inner">
            <TabsTrigger
              value="paid-ads"
              className="px-8 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm"
            >
              <Megaphone className="h-4 w-4" />
              {t("main.tabs.paidAds")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="px-8 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm"
            >
              <Settings2 className="h-4 w-4" />
              {t("main.tabs.settings")}
            </TabsTrigger>
            {isAnnual && (
              <TabsTrigger
                value="automations"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm"
              >
                <Rocket className="h-4 w-4" />
                {t("main.tabs.automations")}
              </TabsTrigger>
            )}
            {isAnnual && (
              <TabsTrigger
                value="festival-messages"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm"
              >
                <Rocket className="h-4 w-4" />
                {t("main.tabs.festivalMessages")}
              </TabsTrigger>
            )}
            {isAnnual && (
              <TabsTrigger
                value="campaigns"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2.5 font-semibold text-sm"
              >
                <Rocket className="h-4 w-4" />
                {t("main.tabs.campaigns")}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Paid Ads Tab */}
        <TabsContent
          value="paid-ads"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="flex justify-center">
            <PaidAdsSettings merchantId={merchantId} />
          </div>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent
          value="settings"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-7 space-y-6">
              <PlatformSettings />
              <PresetReviewsSettings />
            </div>

            <div className="xl:col-span-5 space-y-6 sticky top-8">
              <RewardStrategySettings />
              <div className="p-6 rounded-3xl bg-gray-900 text-white border border-white/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute -top-12 -right-12 p-4 opacity-10 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                  <Rocket className="h-64 w-64 text-white" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                      <Zap className="h-6 w-6 text-emerald-300 fill-emerald-300" />
                    </div>
                    <h4 className="font-bold text-xl tracking-tight uppercase italic underline decoration-emerald-400 decoration-4">
                      {t("main.proTip")}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed font-medium">
                    &quot;{t("main.proTipMessage")}&quot;
                  </p>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-16 bg-emerald-500 rounded-full" />
                    <div className="h-1.5 w-4 bg-emerald-500/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent
          value="automations"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <div className="group transition-all duration-500">
                <BirthdayRewardsSettings />
              </div>
            </div>
            <div className="space-y-8">
              <div className="group transition-all duration-500">
                <InactiveRecallSettings />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="festival-messages"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700 "
        >
          <div className="w-full">
            <FestivalMessages />
          </div>
        </TabsContent>
        <TabsContent
          value="campaigns"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700 "
        >
          <div className="w-full">
            <MerchantCampaigns />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
