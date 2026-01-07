"use client";

import React from "react";
import {
  Star,
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
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
  const merchantId = queryParams.get("merchantId") || queryParams.get("mid") || "1";
  const batchId = queryParams.get("batchId") || queryParams.get("bid") || "1";

  React.useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axiosInstance.get(`/preset-reviews?merchantId=${merchantId}`);
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

      const payload = {
        merchantId: parseInt(merchantId),
        coupon_batch_id: parseInt(batchId),
        email: formValues.email,
        name: formValues.name,
        phoneNumber: formValues.phone,
        date_of_birth: formValues.dob,
        address: formValues.address,
        gender: formValues.gender,
        rating: formValues.rating,
        reviewType: isPresetReview ? "preset" : "custom",
        presetReviewId: isPresetReview ? selectedPresetId : undefined,
        customReviewText: !isPresetReview ? formValues.text : undefined,
        comment: !isPresetReview ? formValues.text : undefined,
        selectedPlatform: mappedPlatform,
        redirectCompleted: false,
      };

      // 1. Submit feedback to system
      const response = await axiosInstance.post("/feedbacks", payload);
      const feedbackId = response.data?.data?.id || response.data?.id;

      if (feedbackId) {
        // 2. Mark redirect as complete
        await axiosInstance
          .patch(`/feedbacks/${feedbackId}/complete-redirect`)
          .then(res => console.log("Redirect status updated:", res.data))
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
      toast.error("Failed to submit feedback");
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
    <div className="w-full">
      <Card className="w-full border-muted/60 shadow-lg overflow-hidden">
        {/* Merchant Branding Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 px-4 text-center text-white">
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            {merchantConfig.name}
          </h2>
          <p className="text-xs opacity-90">{merchantConfig.address}</p>
        </div>

        <CardHeader className="text-center pb-6 pt-10 relative">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors pr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Back
              </span>
            </Button>
          </div>

          <div className="absolute top-4 right-4">
            <div className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              Review Form
            </div>
          </div>

          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Share Your Experience
          </CardTitle>
          <CardDescription className="text-sm">
            Your feedback matters to us!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-10">
          <div className="flex justify-center py-6 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40 transition-colors hover:bg-muted/30">
            <StarRatingInput
              label=""
              name="rating"
              register={register}
              setValue={setValue}
              value={formValues.rating}
              size="lg"
            />
          </div>

          {merchantConfig.enablePresetReviews && presetReviews.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center gap-2 px-1">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Quick Selection
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center justify-center">
                {loadingPresets ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  presetReviews.map((review) => (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() => handlePresetClick(review.review_text, review.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-medium transition-all border shadow-sm ",
                        selectedPresetId === review.id
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-muted/60 hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      {review.review_text}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-4">
            <div className="flex items-center justify-center gap-2 px-1">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Write Your Own Review
              </p>
            </div>

            <TextareaField
              label=""
              name="text"
              placeholder="Write your thoughts here..."
              register={register}
              value={formValues.text}
              onChange={onTextChange}
              errors={{}}
              rows={3}
              className="rounded-xl border-muted/60 focus:border-primary transition-colors resize-none text-sm"
            />
          </div>

          <Button
            className="w-full h-12 text-base font-bold shadow-md transition-all active:scale-95 mt-4 bg-blue-700 hover:bg-blue-800"
            onClick={handleFormSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"} <Send className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>

        <div className="bg-muted/30 py-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest border-t">
          Powered by QR Tenants
        </div>
      </Card>

      {/* Platform Selection Modal */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 text-center text-white relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight mb-2">Almost Done!</DialogTitle>
            <DialogDescription className="text-blue-100 text-sm opacity-90">
              To claim your reward, please post your review on one of these platforms.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-3">
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelection(platform.id)}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/[0.03] transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black mb-3 transition-transform group-hover:scale-110 shadow-lg"
                      style={{ backgroundColor: platform.brandColor }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                      {platform.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-4 text-center text-slate-400 italic text-xs">
                  No social platforms configured.
                </div>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider py-2">
              * You will be redirected to the selected app
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
