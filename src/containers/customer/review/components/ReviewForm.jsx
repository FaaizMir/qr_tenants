"use client";

import React from "react";
import {
  Loader2,
  Star,
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import StarRatingInput from "@/components/form-fields/star-rating-input";
import { TextareaField } from "@/components/form-fields/textarea-field";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  control,
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

  const triggerError = (title, message, details = null) => {
    toast.error(`${title}: ${message}`);
    if (details) console.error("Error details:", details);
  };

  const queryParams = useSearchParams();
  const merchantId =
    queryParams.get("merchantId") || queryParams.get("mid") || "1";

  // Determine batch ID based on lucky draw setting
  // If lucky draw is enabled, don't send batch ID (null)
  // If lucky draw is disabled, use whatsappBatchId from merchant settings
  const urlBatchId = queryParams.get("batchId") || queryParams.get("bid");
  const effectiveBatchId = merchantConfig.luckyDrawEnabled
    ? null
    : merchantConfig.whatsappBatchId || urlBatchId || null;

  React.useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axiosInstance.get(
          `/preset-reviews?merchantId=${merchantId}`,
        );
        setPresetReviews(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching presets:", error);
        toast.info(
          "Quick expressions unavailable. You can write your own feedback.",
        );
        // Continue with empty presets array - not a critical error
        setPresetReviews([]);
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
    // Validate rating
    if (!formValues.rating || formValues.rating < 1) {
      triggerError(
        "Rating Required",
        "Please provide a star rating (1-5 stars) to share your experience.",
      );
      return;
    }

    // Validate review content (either preset or custom text)
    if (!formValues.text && !selectedPresetId) {
      triggerError(
        "Feedback Required",
        "Please share your feedback - select a quick expression or write your own.",
      );
      return;
    }

    // Validate minimum text length if custom review
    if (
      !selectedPresetId &&
      formValues.text &&
      formValues.text.trim().length < 3
    ) {
      triggerError(
        "Feedback Too Short",
        "Please provide more detailed feedback (at least 3 characters).",
      );
      return;
    }

    // Validate identity fields were filled (from previous step)
    if (!formValues.name || formValues.name.trim().length === 0) {
      triggerError(
        "Missing Information",
        "Your name is required. Please go back and fill in your details.",
      );
      return;
    }

    if (!formValues.email || formValues.email.trim().length === 0) {
      triggerError(
        "Missing Information",
        "Email is required. Please go back and fill in your details.",
      );
      return;
    }

    if (!formValues.phone || formValues.phone.trim().length === 0) {
      triggerError(
        "Missing Information",
        "Phone number is required. Please go back and fill in your details.",
      );
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
      const safeBatchId = effectiveBatchId ? parseInt(effectiveBatchId) : null;
      const safeRating = parseInt(formValues.rating) || 5;
      const safePresetId = isPresetReview ? parseInt(selectedPresetId) : null;

      console.log("Lucky Draw Enabled:", merchantConfig.luckyDrawEnabled);
      console.log("Effective Batch ID:", effectiveBatchId);
      console.log("Safe Batch ID:", safeBatchId);

      // Validate merchantId is required
      if (isNaN(safeMerchantId)) {
        triggerError(
          "Invalid Merchant",
          "Invalid merchant profile. Please scan the QR code again or contact staff.",
        );
        return;
      }

      const payload = {
        merchantId: safeMerchantId,
        // Only include batch ID if lucky draw is disabled and batch ID is valid
        ...(safeBatchId &&
          !isNaN(safeBatchId) &&
          safeBatchId > 0 && { coupon_batch_id: safeBatchId }),
        email: formValues.email?.trim() || null,
        name: formValues.name?.trim() || null,
        phoneNumber: formValues.phone?.trim() || null,
        date_of_birth: formValues.dob
          ? formValues.dob.split("-").reverse().join("-")
          : null,
        address: formValues.address?.trim() || null,
        gender: formValues.gender || null,
        rating: safeRating,
        reviewType: isPresetReview ? "preset" : "custom",
        presetReviewId:
          isPresetReview && !isNaN(safePresetId) ? safePresetId : null,
        customReviewText: !isPresetReview
          ? formValues.text?.trim() || null
          : null,
        comment: formValues.text?.trim() || "No specific feedback provided",
        selectedPlatform: mappedPlatform,
        redirectCompleted: false,
      };

      console.log("Submitting feedback payload:", payload);

      // 1. Submit feedback to system
      const response = await axiosInstance.post("/feedbacks", payload);
      console.log("[ReviewForm] Feedback Response:", response.data);
      const feedbackId = response.data?.data?.id || response.data?.id;

      if (feedbackId) {
        // 2. Mark redirect as complete (non-critical - don't block on errors)
        axiosInstance
          .patch(`/feedbacks/${feedbackId}/complete-redirect`)
          .then((res) => console.log("Redirect status updated:", res.data))
          .catch((err) => {
            console.warn("Non-critical error updating redirect status:", err);
            // Don't show error to user - this is a background operation
          });

        const platformMap = {
          google: merchantConfig.googleReviewLink,
          facebook: merchantConfig.facebookReviewLink,
          instagram: merchantConfig.instagramReviewLink,
          red: merchantConfig.redReviewLink,
        };

        const redirectUrl = platformMap[platformId] || merchantConfig.mapLink;

        // 3. Open the URL (with error handling for popup blockers)
        if (redirectUrl) {
          try {
            const newWindow = window.open(redirectUrl, "_blank");
            if (
              !newWindow ||
              newWindow.closed ||
              typeof newWindow.closed === "undefined"
            ) {
              toast.warning("Please allow popups to open the review platform.");
            }
          } catch (err) {
            console.warn("Popup blocked or error:", err);
            toast.warning(
              "Couldn't open review platform. You can review later.",
            );
          }
        }

        setShowPlatformModal(false);
        toast.success("Feedback submitted successfully!");

        const whatsappStatus =
          response.data?.data?.whatsapp_notification ||
          response.data?.whatsapp_notification;
        if (whatsappStatus?.credits_insufficient && !whatsappStatus?.sent) {
          toast.error(
            `Notice: WhatsApp credits are insufficient (Available: ${whatsappStatus?.available_credits ?? 0}) to send the voucher.`,
          );
        } else if (
          whatsappStatus?.sent &&
          !whatsappStatus?.credits_insufficient
        ) {
          toast.success("Success: Reward details sent to your WhatsApp!");
        }

        nextStep(response.data?.data || response.data);
      } else {
        triggerError(
          "Submission Failed",
          "We couldn't save your feedback. Please try again or check your internet connection.",
        );
      }
    } catch (error) {
      console.error("Platform Redirect Error:", error);
      const responseData = error.response?.data;
      const status = error.response?.status;

      let errorMsg =
        "An unexpected error occurred while processing your feedback.";

      // Provide specific error messages based on status
      if (status === 401 || status === 403) {
        errorMsg = "Authentication error. Please scan the QR code again.";
      } else if (status === 400) {
        errorMsg =
          responseData?.message ||
          "Invalid feedback data. Please check your entries.";
      } else if (status === 500) {
        errorMsg =
          "Server error. Your feedback may have been saved. Please contact support.";
      } else if (status === 404) {
        errorMsg = "Service not found. Please contact merchant support.";
      } else if (!error.response) {
        errorMsg = "Network error. Please check your internet connection.";
      } else {
        errorMsg = responseData?.message || errorMsg;
      }

      // Force close the platform modal to show error
      setShowPlatformModal(false);

      // Show toast with the error
      toast.error(errorMsg);

      // Log detailed error
      console.error("Feedback submission error details:", {
        status,
        message: errorMsg,
        response: responseData,
      });
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
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-100 animate-in fade-in duration-700">
      <div className="w-full max-w-[95%] xl:max-w-[1400px] grid lg:grid-cols-2 gap-0 rounded-[2.5rem] overflow-hidden shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] border border-slate-200/50">
        {/* Left Panel - Brand Experience */}
        <div className="hidden lg:flex flex-col justify-center bg-linear-to-br from-amber-500 via-orange-500 to-amber-600 p-8 relative overflow-hidden min-h-[480px]">
          {/* Animated Background Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-700/20 rounded-full blur-3xl animate-pulse-slower"></div>

          {/* Back Button - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="absolute top-8 left-8 h-10 px-4 rounded-full gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Back
            </span>
          </Button>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                Share Your
                <br />
                <span className="text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-amber-100 to-white animate-shimmer bg-size-[200%_100%]">
                  Experience
                </span>
              </h1>
              <p className="text-base text-white/90 font-medium max-w-sm leading-relaxed mx-auto">
                Your feedback shapes our journey. Every review helps us serve
                you better.
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.9★</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                    Rating
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Review Form */}
        <div className="bg-white/80 backdrop-blur-2xl lg:rounded-r-[2.5rem] rounded-3xl lg:rounded-l-none p-5 md:p-6 border border-slate-200/50 shadow-2xl min-h-[480px] flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden mb-5 text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="absolute left-0 top-0 h-10 px-3 rounded-full text-zinc-400 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 mb-4">
              <Star className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">
              {merchantConfig?.name || "Your Feedback"}
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 mt-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 space-y-3">
            {/* Star Rating Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  Overall Rating <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-500 border-2",
                    formValues.rating >= 4
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                      : formValues.rating >= 3
                        ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                        : "bg-red-500/10 text-red-700 border-red-500/30",
                  )}
                >
                  {formValues.rating >= 4
                    ? "Excellent!"
                    : formValues.rating >= 3
                      ? "Good"
                      : formValues.rating
                        ? "Could be better"
                        : "Rate Us"}
                </div>
              </div>

              <div className="flex justify-center py-4 bg-linear-to-br from-amber-50/50 to-white rounded-2xl border-2 border-amber-100/50 shadow-sm">
                <StarRatingInput
                  label=""
                  name="rating"
                  register={register}
                  setValue={setValue}
                  value={formValues.rating}
                  size="xl"
                />
              </div>
            </div>

            {/* Preset Reviews Section */}
            {merchantConfig.enablePresetReviews && presetReviews.length > 0 && (
              <div className="space-y-3 flex flex-col items-center justify-center pt-3">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Quick Expressions
                </Label>

                <div className="flex flex-wrap gap-2 items-center justify-center">
                  {presetReviews.map((review) => (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() =>
                        handlePresetClick(review.review_text, review.id)
                      }
                      className={cn(
                        "px-4 py-2.5 rounded-2xl border-2 text-xs font-bold transition-all duration-300",
                        selectedPresetId === review.id
                          ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                          : "border-slate-200 bg-white text-zinc-600 hover:border-amber-500/50 hover:scale-105 hover:shadow-md",
                      )}
                    >
                      &quot;{review.review_text}&quot;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Review Text */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide flex items-center justify-center">
                Detailed Remarks
              </Label>

              <div className="relative group">
                <div className="absolute top-4 left-4 pointer-events-none transition-all group-focus-within:-translate-y-1 text-zinc-400 group-focus-within:text-amber-500">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <TextareaField
                  name="text"
                  placeholder="Share the details that made your visit special..."
                  control={control}
                  onChange={onTextChange}
                  className="pl-14 pt-4 h-20 rounded-2xl bg-white border-2 border-slate-200 focus:border-amber-500 focus:bg-amber-50/30 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-medium resize-none shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                className="w-full h-14 rounded-2xl text-sm font-bold uppercase tracking-wide bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFormSubmit}
                disabled={loading}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <span className="relative flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-3">
                    Submit Feedback
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-200/50 text-center">
            <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Secured by QR Tenants • All data encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Platform Selection Modal - New Design */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950">
          {/* Header with Progress */}
          <div className="bg-linear-to-r from-amber-500 to-orange-500 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-5 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Step 3 of 3
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Share Your Review</h2>
                <p className="text-white/90 text-sm">
                  Choose a platform to post your feedback and unlock your reward
                </p>
              </div>
            </div>
          </div>

          {/* Platform Options */}
          <div className="p-6 space-y-3">
            {availablePlatforms.length > 0 ? (
              availablePlatforms.map((platform, index) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelection(platform.id)}
                  className="w-full group relative flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 bg-linear-to-r from-white via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Icon Container */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: platform.brandColor,
                    }}
                  >
                    {platform.icon}
                  </div>

                  {/* Platform Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Share and earn rewards
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="text-amber-500 group-hover:translate-x-1 transition-transform">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  No review platforms configured
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Your review is secure and encrypted. Your reward will be sent to
                your WhatsApp immediately.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
