"use client";

import React from "react";
import {
  Star,
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import StarRatingInput from "@/components/form-fields/star-rating-input";
import { TextareaField } from "@/components/form-fields/textarea-field";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

const PLATFORMS = [
  {
    id: "google",
    name: "Google",
    icon: "G",
    brandColor: "#4285F4",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    brandColor: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    brandColor: "#E4405F",
  },
  {
    id: "red",
    name: "RED / 小红书",
    icon: "📕",
    brandColor: "#FF2442",
  },
];

export const ReviewForm = ({
  merchantConfig,
  setValue,
  formValues,
  register,
  nextStep,
  prevStep,
  loading,
  setLoading,
}) => {
  const [presetReviews, setPresetReviews] = React.useState([]);
  const [loadingPresets, setLoadingPresets] = React.useState(true);
  const [selectedPresetId, setSelectedPresetId] = React.useState(null);
  const [showPlatformModal, setShowPlatformModal] = React.useState(false);
  const [recordedFeedbackId, setRecordedFeedbackId] = React.useState(null);

  const queryParams = useSearchParams();
  const merchantId =
    queryParams.get("merchantId") || queryParams.get("mid") || "1";
  const batchId = queryParams.get("batchId") || queryParams.get("bid") || "1";

  React.useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axiosInstance.get(
          `/preset-reviews?merchantId=${merchantId}`
        );
        setPresetReviews(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching presets:", error);
      } finally {
        setLoadingPresets(false);
      }
    };
    fetchPresets();
  }, [merchantId]);

  const handlePresetClick = (text, id) => {
    setValue("text", text);
    setSelectedPresetId(id);
  };

  const onTextChange = (e) => {
    setValue("text", e.target.value);
    setSelectedPresetId(null);
  };

  const handleFormSubmit = () => {
    if (!formValues.rating) {
      toast.error("Please provide a rating");
      return;
    }
    if (!formValues.text && !selectedPresetId) {
      toast.error("Please share some feedback");
      return;
    }
    // Show modal to pick platform before system submission since backend requires it
    setShowPlatformModal(true);
  };

  const handlePlatformSelection = async (platformId) => {
    try {
      setLoading(true);
      setValue("platform", platformId);

      const isPresetReview = selectedPresetId !== null;

      // Map 'red' to 'xiaohongshu' as required by backend
      const mappedPlatform = platformId === "red" ? "xiaohongshu" : platformId;

      // Safety check for numeric values to prevent NaN 500 errors
      const safeMerchantId = parseInt(merchantId);
      const safeBatchId = parseInt(batchId);
      const safeRating = parseInt(formValues.rating) || 5;
      const safePresetId = isPresetReview ? parseInt(selectedPresetId) : null;

      const payload = {
        merchantId: isNaN(safeMerchantId) ? null : safeMerchantId,
        coupon_batch_id: isNaN(safeBatchId) ? null : safeBatchId,
        email: formValues.email,
        name: formValues.name,
        phoneNumber: formValues.phone,
        date_of_birth: formValues.dob || null,
        address: formValues.address,
        gender: formValues.gender,
        rating: safeRating,
        reviewType: isPresetReview ? "preset" : "custom",
        presetReviewId: isNaN(safePresetId) ? null : safePresetId,
        customReviewText: !isPresetReview ? formValues.text : null,
        comment: formValues.text || "No específico feedback provided",
        selectedPlatform: mappedPlatform,
        redirectCompleted: false,
      };

      // Only add batch ID if it's a valid number to avoid foreign key errors
      if (!isNaN(safeBatchId)) {
        payload.coupon_batch_id = safeBatchId;
      }

      // 1. Submit feedback to system
      const response = await axiosInstance.post("/feedbacks", payload);
      const feedbackId = response.data?.data?.id || response.data?.id;

      if (feedbackId) {
        // 2. Mark redirect as complete
        await axiosInstance
          .patch(`/feedbacks/${feedbackId}/complete-redirect`)
          .then((res) => console.log("Redirect status updated:", res.data))
          .catch((err) => console.error("Error completing redirect:", err));

        const platformMap = {
          google: merchantConfig.googleReviewLink,
          facebook: merchantConfig.facebookReviewLink,
          instagram: merchantConfig.instagramReviewLink,
          red: merchantConfig.redReviewLink,
        };

        const redirectUrl = platformMap[platformId] || merchantConfig.mapLink;

        // 3. Open the URL
        if (redirectUrl) {
          window.open(redirectUrl, "_blank");
        }

        setShowPlatformModal(false);
        toast.success("Feedback submitted successfully!");
        nextStep();
      }
    } catch (error) {
      console.error("Platform Redirect Error:", error);

      const responseData = error.response?.data;
      const status = error.response?.status;

      if (status === 500) {
        toast.error(
          "Internal Server Error (500): The system encountered an unexpected issue while saving your feedback. Please try again or contact support."
        );
      } else if (responseData?.errors) {
        // Handle Laravel-style validation errors
        const errorMessages = Object.values(responseData.errors).flat();
        errorMessages.forEach((msg) => toast.error(`Validation Error: ${msg}`));
      } else if (responseData?.message) {
        toast.error(`Error: ${responseData.message}`);
      } else {
        toast.error(
          "An unexpected error occurred. Please check your internet connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const availablePlatforms = PLATFORMS.filter((platform) => {
    if (platform.id === "google") return merchantConfig.enableGoogle;
    if (platform.id === "facebook") return merchantConfig.enableFacebook;
    if (platform.id === "instagram") return merchantConfig.enableInstagram;
    if (platform.id === "red") return merchantConfig.enableRed;
    return false;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-2 md:p-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden rounded-4xl">
        {/* Merchant Branding Banner */}
        <div className="relative h-32 md:h-44 overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),rgba(16,185,129,0))]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl scale-150"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl scale-150"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            {merchantConfig?.logo && (
              <div className="mb-3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 overflow-hidden shadow-2xl">
                <img
                  src={merchantConfig.logo}
                  alt="Merchant Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Share Your Feedback"}
            </h2>
          </div>
        </div>

        <CardHeader className="text-center pb-8 pt-12 relative px-6 md:px-10">
          <div className="absolute top-4 left-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </div>

          <div className="absolute top-4 right-6">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-xs">
              Phase 2: Review
            </div>
          </div>

          <div className="mx-auto w-20 h-20 rounded-3xl bg-linear-to-br from-yellow-400/5 to-yellow-400/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
            <Sparkles className="w-10 h-10 text-yellow-500" />
          </div>

          <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
            SHARE YOUR EXPERIENCE
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto mt-2 leading-tight">
            Your honest feedback fuels our passion for excellence.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-12 px-6 md:px-10">
          {/* Enhanced Star Rating */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/10 to-purple-500/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center justify-center py-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border-2 border-dashed border-zinc-200 dark:border-zinc-700/50 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:border-primary/30">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">
                Overall Rating
              </p>
              <StarRatingInput
                label=""
                name="rating"
                register={register}
                setValue={setValue}
                value={formValues.rating}
                size="xl"
              />
              <div className="mt-4 px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest">
                {formValues.rating >= 4
                  ? "Excellent!"
                  : formValues.rating >= 3
                  ? "Good"
                  : "Could be better"}
              </div>
            </div>
          </div>

          {merchantConfig.enablePresetReviews && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <div className="flex items-center gap-2 px-1">
                <div className="h-4 w-1 bg-primary rounded-full"></div>
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Quick Expressions
                </Label>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center">
                {loadingPresets ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Gathering insights...
                    </span>
                  </div>
                ) : (
                  presetReviews.map((review) => (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() =>
                        handlePresetClick(review.review_text, review.id)
                      }
                      className={cn(
                        "px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-xs active:scale-95",
                        selectedPresetId === review.id
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)]"
                          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      {review.review_text}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
            <div className="flex items-center gap-2 px-1">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Detailed Remarks
              </Label>
            </div>

            <div className="relative group">
              <div className="absolute top-4 left-4 pointer-events-none transition-transform group-focus-within:-translate-y-1">
                <MessageSquare className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              </div>
              <TextareaField
                label=""
                name="text"
                placeholder="Share the details that made your visit special..."
                register={register}
                value={formValues.text}
                onChange={onTextChange}
                errors={{}}
                rows={4}
                className="pl-12 pt-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium resize-none shadow-inner"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button
              className="w-full h-15 rounded-2xl text-lg font-black uppercase tracking-widest shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none group"
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  Seal My Feedback
                  <div className="ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <Send className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <div className="bg-zinc-50 dark:bg-zinc-800/20 py-5 text-center border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Powered by QR Tenants
            </p>
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        </div>
      </Card>

      {/* Premium Platform Selection Modal */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="sm:max-w-md border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] p-0 overflow-hidden rounded-[2.5rem] bg-white">
          <div className="bg-linear-to-br from-zinc-900 to-zinc-800 p-10 text-center text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>

            <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl animate-bounce-slow">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <DialogTitle className="text-3xl font-black tracking-tighter mb-2 italic uppercase">
              ALMOST THERE!
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm font-medium leading-tight max-w-60 mx-auto">
              Share your review on social media to unlock your exclusive
              rewards.
            </DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelection(platform.id)}
                    className="group relative flex flex-col items-center justify-center p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-primary hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.3)] transition-all duration-500"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4 transition-all duration-500 shadow-lg group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        backgroundColor: platform.brandColor,
                        boxShadow: `0 8px 16px -4px ${platform.brandColor}66`,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-primary transition-colors">
                      {platform.name}
                    </span>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-1 w-4 bg-primary rounded-full"></div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400 italic">
                    No social platforms configured.
                  </p>
                </div>
              )}
            </div>

            <div className="relative py-4">
              <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-100"></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none">
                  Security Policy
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
              * Redirection is secure and automated. <br /> Your data remains
              private at all times.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
