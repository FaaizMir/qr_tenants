import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MessageSquareText,
  Megaphone,
  Ticket,
  Cake,
  RotateCw,
  PartyPopper,
  Zap,
  Loader2,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";

const FEATURE_CONFIG = [
  {
    key: "paid_ads",
    labelKey: "paidAds.label",
    descriptionKey: "paidAds.description",
    icon: Megaphone,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },

  {
    key: "enable_google_reviews",
    labelKey: "googleReviews.label",
    descriptionKey: "googleReviews.description",
    icon: Globe,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    key: "enable_facebook_reviews",
    labelKey: "facebookReviews.label",
    descriptionKey: "facebookReviews.description",
    icon: Facebook,
    color: "text-blue-600",
    bg: "bg-blue-50/50",
  },
  {
    key: "enable_instagram_reviews",
    labelKey: "instagramReviews.label",
    descriptionKey: "instagramReviews.description",
    icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-50/50",
  },
  {
    key: "enable_xiaohongshu_reviews",
    labelKey: "xiaohongshuReviews.label",
    descriptionKey: "xiaohongshuReviews.description",
    icon: MessageCircle,
    color: "text-red-500",
    bg: "bg-red-50/50",
  },
  {
    key: "enable_preset_reviews",
    labelKey: "presetReviews.label",
    descriptionKey: "presetReviews.description",
    icon: MessageSquareText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },

  {
    key: "luckydraw_enabled",
    labelKey: "luckyDraw.label",
    descriptionKey: "luckyDraw.description",
    icon: Ticket,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    key: "birthday_message_enabled",
    labelKey: "birthdayMessage.label",
    descriptionKey: "birthdayMessage.description",
    icon: Cake,
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    key: "inactive_recall_enabled",
    labelKey: "inactiveRecall.label",
    descriptionKey: "inactiveRecall.description",
    icon: RotateCw,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    key: "festival_campaign_enabled",
    labelKey: "festivalCampaign.label",
    descriptionKey: "festivalCampaign.description",
    icon: PartyPopper,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    key: "scheduled_campaign_enabled",
    labelKey: "scheduledCampaign.label",
    descriptionKey: "scheduledCampaign.description",
    icon: Megaphone,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

export default function FeatureMasterControl() {
  const t = useTranslations("merchantSettings.featureMasterControl");
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const subscriptionType =
    session?.user?.subscriptionType?.toString?.().toLowerCase() || "temporary";
  const isAnnual = subscriptionType === "annual";

  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!merchantId) return;
    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );
      setSettings(res?.data?.data || {});
    } catch (error) {
      console.error("Failed to load master settings:", error);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (key, value) => {
    if (!merchantId) return;
    setUpdatingKey(key);
    try {
      const payload = { [key]: value };
      await axiosInstance.patch(
        `/merchant-settings/merchant/${merchantId}`,
        payload,
      );

      setSettings((prev) => ({ ...prev, [key]: value }));

      const feature = FEATURE_CONFIG.find((f) => f.key === key);
      const featureLabel = t(`features.${feature?.labelKey || "feature"}`);
      const status = value ? t("active") : t("paused");
      toast.success(
        t("success", { feature: featureLabel, status }),
        {
          description: t("successDescription", { feature: featureLabel.toLowerCase() }),
        },
      );

      window.dispatchEvent(
        new CustomEvent("MERCHANT_SETTINGS_UPDATED", {
          detail: { [key]: value },
        }),
      );
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      toast.error(t("error"), {
        description:
          error?.response?.data?.message ||
          t("errorDescription"),
      });
    } finally {
      setUpdatingKey(null);
    }
  };

  // Filter features based on subscription
  const filteredFeatures = FEATURE_CONFIG.filter((feature) => {
    if (isAnnual) return true;
    // Temporary/Monthly merchants only access basic features
    const allowedKeys = [
      "enable_preset_reviews",
      "enable_google_reviews",
      "paid_ads",
      "luckydraw_enabled",
    ];
    return allowedKeys.includes(feature.key);
  });

  if (loading) {
    return (
      <Card className="border-gray-100 shadow-2xl shadow-gray-200/50 animate-pulse rounded-[2.5rem] bg-white">
        <CardContent className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden bg-white rounded-[2.5rem] relative group/master transition-all duration-700 hover:shadow-primary/5">
      {/* Decorative Premium Glows */}
      <div className="absolute -top-24 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover/master:bg-primary/10 transition-colors duration-1000" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="p-6 border-b border-gray-100 bg-linear-to-r from-emerald-50/20 to-transparent relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-900 rounded-2xl shadow-xl shadow-gray-200 transition-transform group-hover/master:scale-105 duration-500">
              <Zap className="h-5 w-5 text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                  {t("title")}
                </CardTitle>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                  {t("live")}
                </span>
              </div>
              <CardDescription className="text-xs font-medium text-muted-foreground">
                {t("subtitle")}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feature) => {
            const isEnabled = !!settings[feature.key];
            const isUpdating = updatingKey === feature.key;

            return (
              <div
                key={feature.key}
                className={`flex items-center justify-between group transition-all duration-500 ${!isEnabled && "opacity-60"}`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-[1.15rem] ${feature.bg} ${feature.color} shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <feature.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label
                      className={`text-sm font-semibold tracking-tight transition-colors cursor-pointer ${isEnabled ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {t(`features.${feature.labelKey}`)}
                    </Label>
                    <p className="text-[11px] text-muted-foreground font-medium leading-none">
                      {t(`features.${feature.descriptionKey}`)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isUpdating && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(val) => handleToggle(feature.key, val)}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-gray-900"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
