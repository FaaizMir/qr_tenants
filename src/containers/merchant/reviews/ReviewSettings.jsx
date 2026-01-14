"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Save,
  Upload,
  Loader2,
  Sparkles,
  Ticket,
  ChevronDown,
  Check,
  Cake,
  LayoutDashboard,
  Share2,
  Megaphone,
  MessageSquareQuote,
  Ribbon,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

export default function ReviewSettings() {
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
    birthdayMessageEnabled: false,
    daysBeforeBirthday: 3,
    daysAfterBirthday: 0,
    birthdayCouponBatchId: null,
  });
  const [couponBatches, setCouponBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const [birthdayBatchDropdownOpen, setBirthdayBatchDropdownOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const handlePresetChange = (index, value) => {
    const newPresets = [...config.presets];
    newPresets[index] = value;
    setConfig({ ...config, presets: newPresets });
  };

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
      toast.error("Failed to load preset reviews");
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

      // Handle the response structure: { data: { batches: [], total: N } } OR { batches: [], total: N }
      const data = res?.data?.data || res?.data || {};
      console.log("Coupon Batches Response:", data);

      // The API returns batches in the 'batches' key
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
        `/merchant-settings/merchant/${merchantId}`
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
        birthdayMessageEnabled: data.birthday_message_enabled ?? false,
        daysBeforeBirthday: data.days_before_birthday ?? 3,
        daysAfterBirthday: data.days_after_birthday ?? 0,
        birthdayCouponBatchId: data.birthday_coupon_batch_id || null,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load merchant settings");
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

      toast.success("Preset reviews updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error updating preset reviews"
      );
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleUploadPaidAdImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !merchantId) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("paidAdImage", file);

    try {
      const response = await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.data?.paid_ad_image) {
        setConfig((prev) => ({
          ...prev,
          paid_ad_image: response.data.data.paid_ad_image,
        }));
        toast.success("Paid ad image uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveAllSettings = async () => {
    // Validation: If Lucky Draw is disabled, a coupon batch must be selected
    if (!config.luckyDrawEnabled && !config.selectedBatchId) {
      toast.error("Please select a Coupon Batch to continue with Direct Rewards.");
      // Scroll to the empty field or focus the dropdown if possible
      setBatchDropdownOpen(true);
      return;
    }

    if (config.birthdayMessageEnabled && !config.birthdayCouponBatchId) {
      toast.error("Please select a Birthday Coupon Batch to enable Birthday Rewards.");
      setBirthdayBatchDropdownOpen(true);
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
        paid_ads: config.paid_ads,
        // Reward settings - Lucky Draw or Coupon Batch
        luckydraw_enabled: config.luckyDrawEnabled,
        whatsapp_enabled_for_batch_id: config.luckyDrawEnabled
          ? null
          : config.selectedBatchId,
        birthday_message_enabled: config.birthdayMessageEnabled,
        days_before_birthday: Number(config.daysBeforeBirthday),
        days_after_birthday: Number(config.daysAfterBirthday),
        birthday_coupon_batch_id: config.birthdayMessageEnabled ? config.birthdayCouponBatchId : null,
      };

      await axiosInstance.patch(
        `/merchant-settings/merchant/${merchantId}`,
        payload
      );
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error saving settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  // Ensure presets has 10 items for the UI
  useEffect(() => {
    if (config.presets.length < 10) {
      setConfig((prev) => ({
        ...prev,
        presets: [
          ...prev.presets,
          ...Array(10 - prev.presets.length).fill(""),
        ],
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
          Configure how customers interact with your business, manage review platforms, and set up automated rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Platforms & Ads */}
        <div className="xl:col-span-2 space-y-6">
          {/* Review Platforms Card */}
          <Card className="border-muted/40 shadow-sm overflow-hidden bg-linear-to-br from-white to-gray-50/50">
            <CardHeader className="pb-6 border-b border-muted/20 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Review Platforms</CardTitle>
                  <CardDescription>
                    Connect your social profiles to collect reviews
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              {/* Google */}
              <PlatformItem
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                }
                label="Google Business"
                color="hover:border-blue-200 hover:bg-blue-50/30"
                enabled={config.enableGoogle}
                onToggle={(c) => setConfig({ ...config, enableGoogle: c })}
                link={config.googleReviewLink}
                onLinkChange={(e) => setConfig({ ...config, googleReviewLink: e.target.value })}
                placeholder="https://g.page/r/..."
              />

              {/* Facebook */}
              <PlatformItem
                icon={<img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="F" className="w-5 h-5" />}
                label="Facebook Page"
                color="hover:border-indigo-200 hover:bg-indigo-50/30"
                enabled={config.enableFacebook}
                onToggle={(c) => setConfig({ ...config, enableFacebook: c })}
                link={config.facebookReviewLink}
                onLinkChange={(e) => setConfig({ ...config, facebookReviewLink: e.target.value })}
                placeholder="https://facebook.com/..."
              />

              {/* Instagram */}
              <PlatformItem
                icon={<img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="I" className="w-5 h-5" />}
                label="Instagram"
                color="hover:border-pink-200 hover:bg-pink-50/30"
                enabled={config.enableInstagram}
                onToggle={(c) => setConfig({ ...config, enableInstagram: c })}
                link={config.instagramReviewLink}
                onLinkChange={(e) => setConfig({ ...config, instagramReviewLink: e.target.value })}
                placeholder="https://instagram.com/..."
              />

              {/* RED (XiaoHongShu) */}
              <PlatformItem
                icon={<span className="text-red-500 font-bold text-lg leading-none">Red</span>}
                label="XiaoHongShu"
                color="hover:border-red-200 hover:bg-red-50/30"
                enabled={config.enableRed}
                onToggle={(c) => setConfig({ ...config, enableRed: c })}
                link={config.redReviewLink}
                onLinkChange={(e) => setConfig({ ...config, redReviewLink: e.target.value })}
                placeholder="https://xiaohongshu.com/..."
              />
            </CardContent>
          </Card>

          {/* Paid Ads */}
          <Card className="border-muted/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-6 border-b border-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Promotional Ads</CardTitle>
                  <CardDescription>
                    Display a custom banner image to your customers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable Paid Ads</Label>
                  <p className="text-sm text-muted-foreground">Show promotional content on the review page</p>
                </div>
                <Switch
                  checked={config.paid_ads}
                  onCheckedChange={(c) => setConfig({ ...config, paid_ads: c })}
                />
              </div>

              {config.paid_ads && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-muted hover:border-primary/50 transition-colors bg-muted/40 hover:bg-muted/60">
                    <Input
                      id="ad-image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadPaidAdImage}
                      disabled={uploadingImage}
                    />

                    {config.paid_ad_image ? (
                      <div className="relative w-full aspect-21/9">
                        <Image
                          src={config.paid_ad_image}
                          alt="Paid Ad"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                          <Label
                            htmlFor="ad-image-upload"
                            className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" /> Change Image
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <Label
                        htmlFor="ad-image-upload"
                        className="flex flex-col items-center justify-center w-full aspect-21/9 cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-full bg-background shadow-sm flex items-center justify-center mb-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-medium">Upload Banner Image</span>
                        <span className="text-xs text-muted-foreground mt-1">Recommended size: 1200x600px</span>
                      </Label>
                    )}

                    {uploadingImage && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preset Sentences */}
          <Card className="border-muted/40 shadow-sm">
            <CardHeader className="pb-6 border-b border-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                    <MessageSquareQuote className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Quick Review Options</CardTitle>
                    <CardDescription>
                      Pre-written reviews for customers to choose from
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={config.enablePresetReviews}
                  onCheckedChange={(c) => setConfig({ ...config, enablePresetReviews: c })}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${!config.enablePresetReviews ? 'opacity-50 pointer-events-none' : ''}`}>
                {config.presets.map((preset, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {idx + 1}
                    </div>
                    <Input
                      value={preset}
                      onChange={(e) => handlePresetChange(idx, e.target.value)}
                      className="pl-12 bg-muted/20 border-muted/60 focus:bg-background transition-colors"
                      placeholder={`Example: "Great service!"`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePresets}
                  disabled={loadingPresets || !config.enablePresetReviews}
                  className="gap-2"
                >
                  {loadingPresets ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Presets Only
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Strategy & Birthday */}
        <div className="space-y-6">
          {/* Reward Strategy */}
          <Card className="border-muted/40 shadow-sm h-fit">
            <CardHeader className="pb-6 border-b border-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Ribbon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Reward Strategy</CardTitle>
                  <CardDescription>
                    Choose how to reward your customers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Lucky Draw Option */}
              <div
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${config.luckyDrawEnabled ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}`}
                onClick={() => setConfig({ ...config, luckyDrawEnabled: true })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.luckyDrawEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Lucky Draw</p>
                      <p className="text-xs text-muted-foreground">Gamified chance to win</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.luckyDrawEnabled ? 'border-primary' : 'border-muted'}`}>
                    {config.luckyDrawEnabled && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                {config.luckyDrawEnabled && (
                  <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-start gap-2">
                    <span className="mt-0.5">💡</span> Configure prizes in the Lucky Draw tab.
                  </div>
                )}
              </div>

              {/* Direct Coupon Option */}
              <div
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${!config.luckyDrawEnabled ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}`}
                onClick={() => setConfig({ ...config, luckyDrawEnabled: false })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${!config.luckyDrawEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Direct Coupon</p>
                      <p className="text-xs text-muted-foreground">Guaranteed reward via WhatsApp</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!config.luckyDrawEnabled ? 'border-primary' : 'border-muted'}`}>
                    {!config.luckyDrawEnabled && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>

                {!config.luckyDrawEnabled && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs font-medium mb-1.5 block">
                      Select Coupon Batch <span className="text-red-500">*</span>
                    </Label>
                    <BatchSelector
                      selectedId={config.selectedBatchId}
                      batches={couponBatches}
                      isOpen={batchDropdownOpen}
                      setIsOpen={setBatchDropdownOpen}
                      onSelect={(id) => setConfig({ ...config, selectedBatchId: id })}
                      loading={loadingBatches}
                      placeholder="Choose regular reward..."
                    />
                    {!config.selectedBatchId && (
                      <p className="text-[10px] text-red-500 mt-1.5 font-medium flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" /> Required for Direct Coupon
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Birthday Rewards */}
          <Card className="border-muted/40 shadow-sm h-fit">
            <CardHeader className="pb-6 border-b border-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                    <Cake className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Birthday Club</CardTitle>
                    <CardDescription>
                      Automated birthday surprises
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={config.birthdayMessageEnabled}
                  onCheckedChange={(c) => setConfig({ ...config, birthdayMessageEnabled: c })}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className={`space-y-4 transition-all duration-300 ${!config.birthdayMessageEnabled ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Days Before</Label>
                    <Input
                      type="number"
                      min="0"
                      className="bg-muted/30"
                      value={config.daysBeforeBirthday}
                      onChange={(e) => setConfig({ ...config, daysBeforeBirthday: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Days After</Label>
                    <Input
                      type="number"
                      min="0"
                      className="bg-muted/30"
                      value={config.daysAfterBirthday}
                      onChange={(e) => setConfig({ ...config, daysAfterBirthday: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Birthday Coupon Batch</Label>
                  <BatchSelector
                    selectedId={config.birthdayCouponBatchId}
                    batches={couponBatches}
                    isOpen={birthdayBatchDropdownOpen}
                    setIsOpen={setBirthdayBatchDropdownOpen}
                    onSelect={(id) => setConfig({ ...config, birthdayCouponBatchId: id })}
                    loading={loadingBatches}
                    placeholder="Select birthday treat..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white/80 backdrop-blur-md z-50 flex items-center justify-between gap-4 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] lg:pl-96">
        {/* Note: lg:pl-[24rem] assumes a sidebar width, adjust if needed or container it */}
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <div className="items-center gap-2 text-muted-foreground hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm">Changes apply immediately upon save</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="hidden sm:flex"
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveAllSettings}
              disabled={loadingSettings}
              size="lg"
              className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
            >
              {loadingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper Components

function PlatformItem({ icon, label, color, enabled, onToggle, link, onLinkChange, placeholder }) {
  return (
    <div className={`rounded-xl border transition-all duration-300 ${enabled ? `bg-white shadow-sm border-primary/20` : 'bg-muted/10 border-muted/40'}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <Label className={`text-sm font-semibold cursor-pointer ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </Label>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${enabled ? 'grid-rows-[1fr] opacity-100 pb-4 px-4' : 'grid-rows-[0fr] opacity-0 p-0'}`}>
        <div className="overflow-hidden">
          <div className="relative">
            <Input
              value={link}
              onChange={onLinkChange}
              placeholder={placeholder}
              className="pl-9 bg-muted/20 border-muted/60"
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BatchSelector({ selectedId, batches, isOpen, setIsOpen, onSelect, loading, placeholder }) {
  const selectedBatch = batches.find(b => b.id === selectedId);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all bg-background hover:bg-muted/20 ${isOpen ? 'ring-2 ring-primary/10 border-primary' : 'border-muted/60'}`}
      >
        <div className="flex flex-col items-start overflow-hidden">
          <span className={`text-sm truncate w-full ${selectedId ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            {selectedId ? selectedBatch?.batch_name || `Batch #${selectedId}` : placeholder}
          </span>
          {selectedBatch && (
            <span className="text-[10px] text-muted-foreground">
              {selectedBatch.issued_quantity || 0}/{selectedBatch.total_quantity || 0} claimed
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-muted/30 bg-background/95 backdrop-blur-sm shadow-xl max-h-56 overflow-auto animate-in fade-in zoom-in-95 duration-200">
          {loading ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : batches.length === 0 ? (
            <div className="py-3 px-4 text-xs text-muted-foreground text-center">No batches found</div>
          ) : (
            batches.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => { onSelect(batch.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-primary/5 transition-colors ${selectedId === batch.id ? 'bg-primary/10' : ''}`}
              >
                <div className="overflow-hidden">
                  <div className="font-medium text-sm truncate">{batch.batch_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{batch.description || "No description"}</div>
                </div>
                {selectedId === batch.id && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
