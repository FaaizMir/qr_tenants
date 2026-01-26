"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "@/lib/toast";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

// Components
import PlatformSettings from "./components/PlatformSettings";

import PresetReviewsSettings from "./components/PresetReviewsSettings";
import RewardStrategySettings from "./components/RewardStrategySettings";
import BirthdayRewardsSettings from "./components/BirthdayRewardsSettings";
import StickySaveBar from "./components/StickySaveBar";

export default function MerchantSettings() {
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [config, setConfig] = useState({
    luckyDrawEnabled: false,
    selectedBatchId: null,
    enablePresetReviews: false,
    enableGoogle: false,
    enableFacebook: false,
    enableInstagram: false,
    enableRed: false,
    googleReviewLink: "",
    facebookReviewLink: "",
    instagramReviewLink: "",
    redReviewLink: "",
    presets: [],
    paid_ads: false,
    paid_ad_image: "",
    paid_ad_images: [],
    paid_ad_video_enabled: false,
    paid_ad_video: "",
    paid_ad_videos: [],
    placement: "",
    birthdayMessageEnabled: false,
    daysBeforeBirthday: 3,
    daysAfterBirthday: 0,
    birthdayCouponBatchId: null,
  });
  const [couponBatches, setCouponBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const fetchPresetReviews = useCallback(async () => {
    setLoadingPresets(true);

    try {
      const res = await axiosInstance.get("/preset-reviews", {
        params: { merchantId },
      });

      const reviews = res?.data?.data || [];

      // sort by display order
      const sorted = reviews
        .filter((r) => r.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .slice(0, 10); // max 10

      const presetTexts = sorted.map((r) => r.review_text);

      setConfig((prev) => ({
        ...prev,
        presets: presetTexts.length > 0 ? presetTexts : prev.presets,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load preset reviews", {
        closeButton: true,
        duration: false,
      });
    } finally {
      setLoadingPresets(false);
    }
  }, [merchantId]);

  const fetchCouponBatches = useCallback(async () => {
    if (!merchantId) return;
    setLoadingBatches(true);
    try {
      const res = await axiosInstance.get("/coupon-batches", {
        params: { page: 1, pageSize: 20 },
      });

      const data = res?.data?.data || res?.data || {};
      const batches = data.batches || [];
      setCouponBatches(batches);
    } catch (error) {
      console.error("Failed to load coupon batches:", error);
    } finally {
      setLoadingBatches(false);
    }
  }, [merchantId]);

  const fetchMerchantSettings = useCallback(async () => {
    if (!merchantId) return;

    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );

      const data = res?.data?.data;
      if (!data) return;

      setConfig((prev) => ({
        ...prev,
        luckyDrawEnabled: data.luckydraw_enabled ?? false,
        selectedBatchId: data.whatsapp_enabled_for_batch_id || null,
        enablePresetReviews: data.enable_preset_reviews ?? false,
        enableGoogle: data.enable_google_reviews ?? false,
        enableFacebook: data.enable_facebook_reviews ?? false,
        enableInstagram: data.enable_instagram_reviews ?? false,
        enableRed: data.enable_xiaohongshu_reviews ?? false,
        googleReviewLink: data.google_review_url || "",
        facebookReviewLink: data.facebook_page_url || "",
        instagramReviewLink: data.instagram_url || "",
        redReviewLink: data.xiaohongshu_url || "",
        paid_ads: data.paid_ads ?? false,
        paid_ad_image: data.paid_ad_image || "",
        paid_ad_images: data.paid_ad_image ? [data.paid_ad_image] : [],
        paid_ad_video_status: data.paid_ad_type === "video", // Infer status from type if available, otherwise default to false
        paid_ad_video: data.paid_ad_video || "",
        paid_ad_videos: data.paid_ad_video ? [data.paid_ad_video] : [],
        placement: data.paid_ad_placement || "top",
        birthdayMessageEnabled: data.birthday_message_enabled ?? false,
        daysBeforeBirthday: data.days_before_birthday ?? 3,
        daysAfterBirthday: data.days_after_birthday ?? 0,
        birthdayCouponBatchId: data.birthday_coupon_batch_id || null,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load merchant settings", {
        closeButton: true,
        duration: false,
      });
    }
  }, [merchantId]);

  useEffect(() => {
    if (!merchantId) return;

    fetchMerchantSettings();
    fetchPresetReviews();
    fetchCouponBatches();
  }, [
    merchantId,
    fetchMerchantSettings,
    fetchPresetReviews,
    fetchCouponBatches,
  ]);

  const handleSavePresets = async () => {
    setLoadingPresets(true);

    try {
      const payload = {
        reviews: config.enablePresetReviews
          ? config.presets.map((text, index) => ({
              id: index + 1,
              merchant_id: merchantId,
              reviewText: text.trim(),
              isActive: true,
              displayOrder: index + 1,
            }))
          : [],
      };

      const response = await axiosInstance.patch("/preset-reviews", payload);

      if (![200, 201].includes(response.status)) {
        throw new Error("Failed to save preset reviews");
      }

      toast.success("Preset reviews updated successfully", {
        closeButton: true,
        duration: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error updating preset reviews",
        { closeButton: true, duration: false },
      );
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleSaveAllSettings = async () => {
    // Validation
    if (!config.luckyDrawEnabled && !config.selectedBatchId) {
      toast.error(
        "Please select a Coupon Batch to continue with Direct Rewards.",
        { closeButton: true, duration: false },
      );
      return;
    }

    if (config.birthdayMessageEnabled && !config.birthdayCouponBatchId) {
      toast.error(
        "Please select a Birthday Coupon Batch to enable Birthday Rewards.",
        { closeButton: true, duration: false },
      );
      return;
    }

    setLoadingSettings(true);

    try {
      const payload = {
        merchant_id: merchantId,
        // Platform settings
        enable_preset_reviews: config.enablePresetReviews,
        enable_google_reviews: config.enableGoogle,
        enable_facebook_reviews: config.enableFacebook,
        enable_instagram_reviews: config.enableInstagram,
        enable_xiaohongshu_reviews: config.enableRed,
        google_review_url: config.enableGoogle ? config.googleReviewLink : null,
        facebook_page_url: config.enableFacebook
          ? config.facebookReviewLink
          : null,
        instagram_url: config.enableInstagram
          ? config.instagramReviewLink
          : null,
        xiaohongshu_url: config.enableRed ? config.redReviewLink : null,
        //  paid_ads: config.paid_ads,
        //  paid_ad_image: config.paid_ad_image,
        //  paid_ad_video: config.paid_ad_video,
        //  paid_ad_type: config.paid_ad_video_status ? "video" : "image",
        //  paid_ad_placement: config.placement,
        // Reward settings - Lucky Draw or Coupon Batch
        luckydraw_enabled: config.luckyDrawEnabled,
        whatsapp_enabled_for_batch_id: config.luckyDrawEnabled
          ? null
          : config.selectedBatchId,
        birthday_message_enabled: config.birthdayMessageEnabled,
        days_before_birthday: Number(config.daysBeforeBirthday),
        days_after_birthday: Number(config.daysAfterBirthday),
        birthday_coupon_batch_id: config.birthdayMessageEnabled
          ? config.birthdayCouponBatchId
          : null,
      };

      await axiosInstance.patch(
        `/merchant-settings/merchant/${merchantId}`,
        payload,
      );
      toast.success("Settings saved successfully", {
        closeButton: true,
        duration: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error saving settings", {
        closeButton: true,
        duration: false,
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  // Ensure presets has 10 items for the UI
  useEffect(() => {
    if (config.presets.length < 10) {
      setConfig((prev) => ({
        ...prev,
        presets: [...prev.presets, ...Array(10 - prev.presets.length).fill("")],
      }));
    }
  }, [config.presets.length]);

  return (
    <div className="relative pb-24 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Review & Reward Settings
        </h2>
        <p className="text-muted-foreground text-base max-w-2xl">
          Configure how customers interact with your business, manage review
          platforms, and set up automated rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Platforms & Ads */}
        <div className="xl:col-span-2 space-y-6">
          <PlatformSettings config={config} setConfig={setConfig} />

          <PresetReviewsSettings
            config={config}
            setConfig={setConfig}
            loadingPresets={loadingPresets}
            onSavePresets={handleSavePresets}
          />
        </div>

        {/* Right Column: Strategy & Birthday */}
        <div className="space-y-6">
          <RewardStrategySettings
            config={config}
            setConfig={setConfig}
            couponBatches={couponBatches}
            loadingBatches={loadingBatches}
          />

          <BirthdayRewardsSettings
            config={config}
            setConfig={setConfig}
            couponBatches={couponBatches}
            loadingBatches={loadingBatches}
          />
        </div>
      </div>

      <StickySaveBar loading={loadingSettings} onSave={handleSaveAllSettings} />
    </div>
  );
}
