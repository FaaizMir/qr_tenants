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
  const [selectedPlatform, setSelectedPlatform] = React.useState(null);
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

    // Validate platform selection
    if (!selectedPlatform) {
      triggerError(
        "Platform Required",
        "Please select a review platform to continue.",
      );
      return;
    }

    // Submit with selected platform
    handlePlatformSelection(selectedPlatform);
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
    <div className=" w-full flex items-center justify-center p-4 md:p-6 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-0 items-center">
        {/* Left Panel - Brand Experience */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16 bg-linear-to-br from-primary via-primary/95 to-primary/80  h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          </div>

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
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Share Your
                <br />
                <span className="text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-primary-100 to-white animate-shimmer bg-size-[200%_100%]">
                  Experience
                </span>
              </h1>
              <p className="text-base text-white/90 font-medium max-w-sm leading-relaxed mx-auto">
                Your feedback shapes our journey. Every review helps us serve
                you better.
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">4.9★</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    Rating
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">10K+</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Review Form */}
        <div className="bg-white/95 backdrop-blur-3xl  p-8 md:p-12 lg:p-14 border border-slate-200/50 shadow-2xl h-full flex flex-col relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[24px_24px]"></div>

          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center relative pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="absolute left-0 top-0 h-10 px-3 rounded-full text-zinc-400 hover:text-primary transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/5 backdrop-blur-md border border-primary/10 mb-6 group">
              <Star className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">
              {merchantConfig?.name || "Your Feedback"}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-500">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-6 w-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 py-2">
            {/* Star Rating Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  Overall Rating <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all border",
                    formValues.rating >= 4
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : formValues.rating >= 3
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200",
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

              <div className="flex justify-center py-6 bg-slate-50/80 rounded-xl border border-slate-200">
                <StarRatingInput
                  label=""
                  name="rating"
                  register={register}
                  setValue={setValue}
                  value={formValues.rating}
                  size="lg"
                />
              </div>
            </div>

            {/* Preset Reviews Section */}
            {merchantConfig.enablePresetReviews && presetReviews.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  Quick Expressions
                </Label>

                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100 hover:scrollbar-thumb-zinc-400">
                  {presetReviews.map((review) => (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() =>
                        handlePresetClick(review.review_text, review.id)
                      }
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                        selectedPresetId === review.id
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-slate-200 bg-white text-zinc-600 hover:border-primary/50 hover:bg-slate-50",
                      )}
                    >
                      &quot;{review.review_text}&quot;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Review Text */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                Detailed Remarks
              </Label>

              <TextareaField
                name="text"
                placeholder="Share the details that made your visit special..."
                control={control}
                onChange={onTextChange}
                className=" pl-10
  min-h-20
  px-8
  py-3
  rounded-xl
  bg-white
  border
  border-slate-200
  text-sm
  leading-relaxed
  text-slate-800
  placeholder:text-slate-400
  resize-none
  transition-all
  duration-200
  hover:border-slate-300
  focus:border-primary
  focus:ring-2
  focus:ring-primary/15
  focus:outline-none
"
              />
            </div>
          </div>
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
              Select Review Platform
            </Label>

            <div className="flex items-center gap-2.5 flex-wrap pb-4">
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold transition-colors duration-200",
                      selectedPlatform === platform.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-70 hover:opacity-100",
                    )}
                    style={{
                      backgroundColor: platform.brandColor,
                    }}
                    title={platform.name}
                  >
                    {platform.icon}
                  </button>
                ))
              ) : (
                <div className="py-6 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 w-full">
                  <p className="text-sm font-semibold text-zinc-500">
                    No review platforms configured
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Submit Button & Footer */}
          <div className="pt-6 mt-auto space-y-6 bg-white/50 backdrop-blur-sm z-10 border-t border-slate-200/50 -mx-8 px-8 md:-mx-12 md:px-12 lg:-mx-14 lg:px-14 -mb-8 pb-8 md:-mb-12 md:pb-12 lg:-mb-14 lg:pb-14">
            <Button
              className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wide bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all active:scale-95"
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Submit Feedback
                  <Send className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Secured by QR Tenants • All data encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
