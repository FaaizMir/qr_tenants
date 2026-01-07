"use client";

import React, { useEffect, useState } from "react";
import { Save, Plus, Trash2, HelpCircle, Upload, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

export default function ReviewSettings() {
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [config, setConfig] = useState({
    rewardType: "lucky_draw", // options: "none", "coupon", "lucky_draw"
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
    // visibility_logic: 0,
    // placement: "top",
    paid_ads: false,
    paid_ad_image: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const handlePresetChange = (index, value) => {
    const newPresets = [...config.presets];
    newPresets[index] = value;
    setConfig({ ...config, presets: newPresets });
  };

  const fetchPresetReviews = async () => {
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
  };

  const fetchMerchantSettings = async () => {
    if (!merchantId) return;

    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`
      );

      const data = res?.data?.data;
      if (!data) return;

      setConfig((prev) => ({
        ...prev,

        enablePresetReviews: data.enable_preset_reviews ?? false,
        enableGoogle: data.enable_google_reviews ?? false,
        enableFacebook: data.enable_facebook_reviews ?? false,
        enableInstagram: data.enable_instagram_reviews ?? false,
        enableRed: data.enable_xiaohongshu_reviews ?? false,
        googleReviewLink: data.google_review_url || "",
        facebookReviewLink: data.facebook_page_url || "",
        instagramReviewLink: data.instagram_url || "",
        redReviewLink: data.xiaohongshu_url || "",
        // visibility_logic: data.visibility_logic ?? 0,
        // placement: data.placement || "top",
        paid_ads: data.paid_ads ?? false,
        paid_ad_image: data.paid_ad_image || "",
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load merchant settings");
    }
  };

  useEffect(() => {
    if (!merchantId) return;

    fetchMerchantSettings();
    fetchPresetReviews();
  }, [merchantId]);

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

  const handleSavePlatforms = async () => {
    setLoadingPlatforms(true);

    try {
      const payload = {
        merchant_id: merchantId,
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
        // visibility_logic: parseInt(config.visibility_logic) || 0,
        // placement: config.placement,
        paid_ads: config.paid_ads,
      };

      await axiosInstance.patch(
        `/merchant-settings/merchant/${merchantId}`,
        payload
      );
      toast.success("Platform settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error updating platform settings"
      );
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const handleSaveFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const payload = {
        merchantId: merchantId,
        rewardType: config.rewardType,
      };

      await axiosInstance.post("/merchant-settings", payload);

      toast.success("Feature settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error updating feature settings"
      );
    } finally {
      setLoadingFeatures(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Review & Reward Settings
        </h2>
        <p className="text-muted-foreground text-base">
          Configure how customers review your business and what rewards they receive.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Links */}
        <Card className="border-muted/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Review Platforms</CardTitle>
            <CardDescription className="text-sm">
              Enable platforms where customers can post reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                <Label className="font-medium cursor-pointer">Google Business Profile</Label>
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
                    setConfig({ ...config, googleReviewLink: e.target.value })
                  }
                  className="animate-in fade-in slide-in-from-top-2"
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                <Label className="font-medium cursor-pointer">Facebook Page</Label>
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
                    setConfig({ ...config, facebookReviewLink: e.target.value })
                  }
                  className="animate-in fade-in slide-in-from-top-2"
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                <Label className="font-medium cursor-pointer">Instagram Profile/Post</Label>
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
                    setConfig({ ...config, instagramReviewLink: e.target.value })
                  }
                  className="animate-in fade-in slide-in-from-top-2"
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-3 hover:border-primary/40 hover:bg-primary/5 transition">
                <Label className="font-medium cursor-pointer">XiaoHongShu (RED)</Label>
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

            <Separator />

            <div className="space-y-4 pt-4">
              {/* <h3 className="text-lg font-medium">Display & Ads</h3> */}
              {/* <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visibility_logic">Visibility Logic (Number)</Label>
                  <Input
                    id="visibility_logic"
                    type="number"
                    placeholder="0"
                    value={config.visibility_logic}
                    onChange={(e) =>
                      setConfig({ ...config, visibility_logic: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <Select
                    value={config.placement}
                    onValueChange={(v) => setConfig({ ...config, placement: v })}
                  >
                    <SelectTrigger id="placement">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div> */}

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Paid Ads</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable promotional images on your review page
                    </p>
                  </div>
                  <Switch
                    checked={config.paid_ads}
                    onCheckedChange={(c) => setConfig({ ...config, paid_ads: c })}
                  />
                </div>

                {config.paid_ads && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Ad Image</Label>
                    <div className="relative group">
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50 transition-colors hover:bg-muted/80">
                        {config.paid_ad_image ? (
                          <div className="relative w-full aspect-video rounded-md overflow-hidden">
                            <img
                              src={config.paid_ad_image}
                              alt="Paid Ad"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Label
                                htmlFor="ad-image-upload"
                                className="cursor-pointer bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" /> Change Image
                              </Label>
                            </div>
                          </div>
                        ) : (
                          <Label
                            htmlFor="ad-image-upload"
                            className="flex flex-col items-center gap-2 cursor-pointer w-full"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Click to upload ad image</span>
                            <span className="text-xs text-muted-foreground underline decoration-dotted">The image is saved immediately</span>
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
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-6 bg-muted/5">
            <Button onClick={handleSavePlatforms} disabled={loadingPlatforms}>
              {loadingPlatforms ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Platforms
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Feature Toggles */}
        <Card className="border-muted/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Features & Rewards</CardTitle>
            <CardDescription className="text-sm">
              Choose your customer reward strategy
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Reward Strategy</Label>
              <div className="grid grid-cols-1 gap-3">
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === "none"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-muted/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  onClick={() => setConfig({ ...config, rewardType: "none" })}
                >
                  <div className="font-semibold mb-1.5">No Reward</div>
                  <div className="text-sm text-muted-foreground">
                    Review only. No incentive provided.
                  </div>
                </div>
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === "coupon"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-muted/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  onClick={() => setConfig({ ...config, rewardType: "coupon" })}
                >
                  <div className="font-semibold mb-1.5">Direct Coupon</div>
                  <div className="text-sm text-muted-foreground">
                    Send a fixed coupon via WhatsApp immediately.
                  </div>
                </div>
                <div
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === "lucky_draw"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-muted/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  onClick={() =>
                    setConfig({ ...config, rewardType: "lucky_draw" })
                  }
                >
                  <div className="font-semibold mb-1.5">Lucky Draw</div>
                  <div className="text-sm text-muted-foreground">
                    Gamified experience with variable prizes.
                  </div>
                </div>
              </div>

              {config.rewardType === "lucky_draw" && (
                <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200 animate-in fade-in slide-in-from-top-2">
                  💡 Manage prizes and probabilities in the <b>Lucky Draw</b> tab.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-6 bg-muted/5">
            <Button onClick={handleSaveFeatures} disabled={loadingFeatures}>
              {loadingFeatures ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Features
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Preset Sentences Editor */}
        <Card className="lg:col-span-2 border-muted/60">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Left side: Title + Description */}
              <div className="flex-1">
                <CardTitle className="text-xl">Preset Review Sentences</CardTitle>
                <CardDescription className="text-sm mt-1.5">
                  Customize quick-reply options your customers see (max 10)
                </CardDescription>
              </div>

              {/* Right side: Toggle */}
              <div className="flex items-center gap-3 rounded-lg border border-muted/60 bg-muted/20 px-4 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition">
                <Label className="text-sm font-medium whitespace-nowrap cursor-pointer">
                  Enable Presets
                </Label>
                <Switch
                  checked={config.enablePresetReviews}
                  onCheckedChange={(c) =>
                    setConfig({ ...config, enablePresetReviews: c })
                  }
                />
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
                "Saving..."
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
