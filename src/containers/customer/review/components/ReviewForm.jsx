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
        triggerError(
          "System Notice",
          "We couldn't load the pre-written reviews, but you can still write your own feedback below.",
        );
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

      const errorMsg =
        responseData?.message ||
        "An unexpected error occurred while processing your feedback.";

      // Force close the platform modal to show error
      setShowPlatformModal(false);

      triggerError(errorMsg);
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <Card className="w-full border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white ">
        <CardHeader className="flex flex-col items-center text-center pb-8 border-b border-zinc-100/50 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="absolute left-6 top-8 h-8 rounded-full gap-2 text-zinc-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">
              Back
            </span>
          </Button>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary mb-4 shadow-sm">
            <Star className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 w-full max-w-lg">
            <CardTitle className="text-3xl font-black tracking-tight">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Feedback"}
            </CardTitle>
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
            <CardDescription className="text-base font-medium pt-1">
              We value your honest opinion.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-12 px-8 md:px-16 space-y-12">
          {/* Enhanced Star Rating */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Overall Rating
              </Label>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-500",
                  formValues.rating >= 4
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : formValues.rating >= 3
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "bg-red-500/10 text-red-600 border border-red-500/20",
                )}
              >
                {formValues.rating >= 4
                  ? "Excellent!"
                  : formValues.rating >= 3
                    ? "Good"
                    : "Could be better"}
              </div>
            </div>

            <div className="flex justify-center py-8 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
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
          {merchantConfig.enablePresetReviews && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Quick Expressions
                </Label>
              </div>

              <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                {presetReviews.map((review) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() =>
                      handlePresetClick(review.review_text, review.id)
                    }
                    className={cn(
                      "px-4 py-2 rounded-full border text-[11px] font-bold transition-all duration-300 relative",
                      selectedPresetId === review.id
                        ? "border-primary bg-primary text-white shadow-md scale-105"
                        : "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-zinc-500 hover:border-primary/50 hover:bg-zinc-50",
                    )}
                  >
                    <span className="relative z-10">
                      &quot;{review.review_text}&quot;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-500 pl-1">
              Detailed Remarks
            </Label>

            <div className="relative group">
              <div className="absolute top-4 left-4 pointer-events-none transition-transform group-focus-within:-translate-y-1 text-zinc-400 group-focus-within:text-primary">
                <MessageSquare className="w-4 h-4" />
              </div>
              <TextareaField
                name="text"
                placeholder="Share the details that made your visit special..."
                control={control}
                onChange={onTextChange}
                className="pl-12 pt-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium resize-none shadow-inner min-h-[120px]"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button
              className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white group"
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Seal My Feedback
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 py-4 flex justify-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            Verified Secure Experience{" "}
            <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Powered
            by QR Tenants
          </p>
        </CardFooter>
      </Card>

      {/* Premium Platform Selection Modal */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-950">
          <div className="bg-zinc-900 p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <DialogTitle className="text-2xl font-bold tracking-tight mb-2 uppercase italic">
              Almost Done!
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs font-medium">
              Select a platform to share your review and unlock your reward.
            </DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelection(platform.id)}
                    className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-primary hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black mb-3 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: platform.brandColor,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-primary transition-colors">
                      {platform.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-400 italic">
                    No platforms configured.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-widest">
              Action is secure & verified.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
