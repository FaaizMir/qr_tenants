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
import { Separator } from "@/components/ui/separator";
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
  });
  const [couponBatches, setCouponBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Review & Reward Settings
        </h2>
        <p className="text-muted-foreground text-base">
          Configure how customers review your business and what rewards they
          receive.
        </p>
      </div>

      <div className="space-y-6">
        {/* Review Platforms Card */}
        <Card className="border-muted/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Review Platforms</CardTitle>
            <CardDescription className="text-sm">
              Enable platforms where customers can post reviews and provide URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Google */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                  <Label className="font-medium cursor-pointer">
                    Google Business Profile
                  </Label>
                  <Switch
                    checked={config.enableGoogle}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, enableGoogle: c })
                    }
                  />
                </div>
                {config.enableGoogle && (
                  <Input
                    placeholder="https://g.page/r/..."
                    value={config.googleReviewLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        googleReviewLink: e.target.value,
                      })
                    }
                    className="animate-in fade-in slide-in-from-top-2"
                  />
                )}
              </div>

              {/* Facebook */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                  <Label className="font-medium cursor-pointer">
                    Facebook Page
                  </Label>
                  <Switch
                    checked={config.enableFacebook}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, enableFacebook: c })
                    }
                  />
                </div>
                {config.enableFacebook && (
                  <Input
                    placeholder="https://facebook.com/..."
                    value={config.facebookReviewLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        facebookReviewLink: e.target.value,
                      })
                    }
                    className="animate-in fade-in slide-in-from-top-2"
                  />
                )}
              </div>

              {/* Instagram */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                  <Label className="font-medium cursor-pointer">
                    Instagram Profile/Post
                  </Label>
                  <Switch
                    checked={config.enableInstagram}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, enableInstagram: c })
                    }
                  />
                </div>
                {config.enableInstagram && (
                  <Input
                    placeholder="https://instagram.com/..."
                    value={config.instagramReviewLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        instagramReviewLink: e.target.value,
                      })
                    }
                    className="animate-in fade-in slide-in-from-top-2"
                  />
                )}
              </div>

              {/* RED */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                  <Label className="font-medium cursor-pointer">
                    XiaoHongShu (RED)
                  </Label>
                  <Switch
                    checked={config.enableRed}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, enableRed: c })
                    }
                  />
                </div>
                {config.enableRed && (
                  <Input
                    placeholder="https://..."
                    value={config.redReviewLink}
                    onChange={(e) =>
                      setConfig({ ...config, redReviewLink: e.target.value })
                    }
                    className="animate-in fade-in slide-in-from-top-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reward Strategy Card */}
          <Card className="border-muted/60 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Reward Strategy</CardTitle>
              <CardDescription className="text-sm">
                Enable lucky draw rewards or direct coupons
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${config.luckyDrawEnabled
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${config.luckyDrawEnabled ? "bg-primary/20" : "bg-muted"
                      }`}
                  >
                    <Sparkles
                      className={`h-6 w-6 ${config.luckyDrawEnabled
                          ? "text-primary"
                          : "text-muted-foreground"
                        }`}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold cursor-pointer">
                      Lucky Draw
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Gamified experience for customers
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.luckyDrawEnabled}
                  onCheckedChange={(c) =>
                    setConfig({ ...config, luckyDrawEnabled: c })
                  }
                />
              </div>

              {config.luckyDrawEnabled && (
                <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200 animate-in fade-in slide-in-from-top-2">
                  💡 Manage prizes and probabilities in the <b>Lucky Draw</b>{" "}
                  tab.
                </div>
              )}

              {!config.luckyDrawEnabled && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div
                    className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${config.selectedBatchId
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted/60 bg-muted/20"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${config.selectedBatchId ? "bg-primary/20" : "bg-muted"
                          }`}
                      >
                        <Ticket
                          className={`h-6 w-6 ${config.selectedBatchId
                              ? "text-primary"
                              : "text-muted-foreground"
                            }`}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-base font-semibold">
                          Direct Coupon
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Send coupons via WhatsApp
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-sm font-medium mb-2 block">
                      Select Coupon Batch
                    </Label>
                    <button
                      type="button"
                      onClick={() => setBatchDropdownOpen(!batchDropdownOpen)}
                      className={`w-full flex items-center justify-between rounded-lg border-2 px-4 py-2.5 text-left transition-all ${batchDropdownOpen
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted/60 hover:border-primary/40"
                        } bg-background`}
                    >
                      <span
                        className={`text-sm ${config.selectedBatchId
                            ? "text-foreground"
                            : "text-muted-foreground"
                          }`}
                      >
                        {config.selectedBatchId
                          ? couponBatches.find(
                            (b) => b.id === config.selectedBatchId
                          )?.batch_name || "Selected Batch"
                          : "Choose a coupon batch..."}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${batchDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {batchDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-muted/60 bg-background shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                        {loadingBatches ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : couponBatches.length === 0 ? (
                          <div className="py-4 px-4 text-sm text-muted-foreground text-center">
                            No coupon batches found.
                          </div>
                        ) : (
                          couponBatches.map((batch) => (
                            <button
                              key={batch.id}
                              type="button"
                              onClick={() => {
                                setConfig({
                                  ...config,
                                  selectedBatchId: batch.id,
                                });
                                setBatchDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors ${config.selectedBatchId === batch.id
                                  ? "bg-primary/5"
                                  : ""
                                }`}
                            >
                              <div>
                                <div className="font-medium text-sm">
                                  {batch.batch_name}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {batch.issued_quantity || 0} /{" "}
                                  {batch.total_quantity || 0} issued
                                </div>
                              </div>
                              {config.selectedBatchId === batch.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings Card */}
          <Card className="border-muted/60 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Additional Settings</CardTitle>
              <CardDescription className="text-sm">
                Configure preset reviews and promotional ads
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Enable Preset Reviews
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show quick-reply review options
                    </p>
                  </div>
                  <Switch
                    checked={config.enablePresetReviews}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, enablePresetReviews: c })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Paid Ads</Label>
                    <p className="text-xs text-muted-foreground">
                      Display promotional images
                    </p>
                  </div>
                  <Switch
                    checked={config.paid_ads}
                    onCheckedChange={(c) =>
                      setConfig({ ...config, paid_ads: c })
                    }
                  />
                </div>
              </div>

              {config.paid_ads && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-sm font-medium">Ad Image</Label>
                  <div className="relative group">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/50 transition-colors hover:bg-muted/80">
                      {config.paid_ad_image ? (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden">
                          <Image
                            src={config.paid_ad_image}
                            alt="Paid Ad"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Label
                              htmlFor="ad-image-upload"
                              className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2"
                            >
                              <Upload className="h-3.5 w-3.5" /> Change
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <Label
                          htmlFor="ad-image-upload"
                          className="flex flex-col items-center gap-2 cursor-pointer w-full py-4"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-center">
                            Click to upload ad image
                          </span>
                        </Label>
                      )}
                      <Input
                        id="ad-image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUploadPaidAdImage}
                        disabled={uploadingImage}
                      />
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Global Save Button Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <p className="text-sm text-muted-foreground italic">
            * Changes made here will affect the review experience immediately.
          </p>
          <Button
            onClick={handleSaveAllSettings}
            disabled={loadingSettings}
            size="lg"
            className="w-full sm:w-auto shadow-sm"
          >
            {loadingSettings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save All Settings
              </>
            )}
          </Button>
        </div>

        {/* Preset Sentences Editor - Separate Card */}
        <Card className="border-muted/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl">
                  Preset Review Sentences
                </CardTitle>
                <CardDescription className="text-sm mt-1.5">
                  Customize quick-reply options your customers see (max 10)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {config.presets.map((preset, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold shrink-0">
                    {idx + 1}
                  </div>
                  <Input
                    value={preset}
                    onChange={(e) => handlePresetChange(idx, e.target.value)}
                    disabled={!config.enablePresetReviews || loadingPresets}
                    className="flex-1"
                    placeholder={`Preset review ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-6 bg-muted/5">
            <Button onClick={handleSavePresets} disabled={loadingPresets}>
              {loadingPresets ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Presets
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
